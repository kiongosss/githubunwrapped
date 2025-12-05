import { graphql } from '@octokit/graphql'
import { startOfYear, endOfYear, format, parseISO, differenceInDays } from 'date-fns'
import type { GitHubStats, GitHubContribution } from '@/types/github'
import { getCachedData, setCachedData } from './cache'

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql'

// GraphQL query to fetch comprehensive GitHub data
const GITHUB_STATS_QUERY = `
  query GitHubStats($from: DateTime!, $to: DateTime!) {
    viewer {
      login
      name
      avatarUrl
      createdAt
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              weekday
            }
          }
        }
      }
      repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}) {
        nodes {
          name
          primaryLanguage {
            name
            color
          }
          stargazerCount
          forkCount
          createdAt
          updatedAt
        }
      }
    }
  }
`

// Additional query for commit timing data
const COMMIT_TIMING_QUERY = `
  query CommitTiming {
    viewer {
      repositories(first: 50, ownerAffiliations: OWNER) {
        nodes {
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 100) {
                  nodes {
                    committedDate
                    message
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

export async function generateUnwrapped(accessToken: string): Promise<GitHubStats> {
  const cacheKey = `github-unwrapped-${accessToken.slice(-8)}`
  
  // Check cache first
  const cached = await getCachedData<GitHubStats>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${accessToken}`,
      },
    })

    // Get current year date range
    const currentYear = new Date().getFullYear()
    const fromDate = startOfYear(new Date(currentYear, 0, 1))
    const toDate = endOfYear(new Date(currentYear, 11, 31))

    // Fetch main stats
    const response = await graphqlWithAuth(GITHUB_STATS_QUERY, {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    }) as any

    const user = response.viewer
    const contributions = user.contributionsCollection
    const repositories = user.repositories.nodes

    // Process contribution calendar data
    const contributionDays: GitHubContribution[] = []
    contributions.contributionCalendar.weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        contributionDays.push({
          date: day.date,
          contributionCount: day.contributionCount,
          weekday: day.weekday,
        })
      })
    })

    // Calculate statistics
    const stats = await calculateStats(user, contributions, repositories, contributionDays)

    // Cache the results for 6 hours
    await setCachedData(cacheKey, stats, 6 * 60 * 60 * 1000)

    return stats
  } catch (error) {
    console.error('Error generating GitHub Unwrapped:', error)
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Bad credentials')) {
        throw new Error('Invalid GitHub token. Please try signing in again.')
      }
      if (error.message.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.')
      }
      if (error.message.includes('Not Found')) {
        throw new Error('Unable to access your GitHub data. Please check your permissions.')
      }
    }
    
    throw new Error('Failed to fetch GitHub data. Please check your permissions and try again.')
  }
}

async function calculateStats(
  user: any,
  contributions: any,
  repositories: any[],
  contributionDays: GitHubContribution[]
): Promise<GitHubStats> {
  // Total contributions
  const totalContributions = contributions.totalCommitContributions +
    contributions.totalIssueContributions +
    contributions.totalPullRequestContributions +
    contributions.totalPullRequestReviewContributions

  // Language statistics
  const languageStats = calculateLanguageStats(repositories)
  const topLanguage = languageStats[0] || { name: 'Unknown', percentage: 0 }

  // Longest streak
  const longestStreak = calculateLongestStreak(contributionDays)

  // Most active time (simplified - would need commit timing data for accuracy)
  const mostActiveTime = calculateMostActiveTime(contributionDays)

  // Commit type breakdown
  const commitTypeBreakdown = {
    commits: contributions.totalCommitContributions,
    pullRequests: contributions.totalPullRequestContributions,
    issues: contributions.totalIssueContributions,
    reviews: contributions.totalPullRequestReviewContributions,
  }

  // Busiest day
  const busiestDay = calculateBusiestDay(contributionDays)

  // Sleep efficiency (estimated based on contribution patterns)
  const sleepEfficiency = calculateSleepEfficiency(contributionDays)

  // Monthly activity
  const monthlyActivity = calculateMonthlyActivity(contributionDays)

  return {
    totalContributions,
    topLanguage,
    longestStreak,
    mostActiveTime,
    commitTypeBreakdown,
    busiestDay,
    sleepEfficiency,
    monthlyActivity,
    languageStats,
    user: {
      login: user.login,
      name: user.name || user.login,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
  }
}

function calculateLanguageStats(repositories: any[]) {
  const languageCounts: Record<string, number> = {}
  let totalRepos = 0

  repositories.forEach(repo => {
    if (repo.primaryLanguage) {
      languageCounts[repo.primaryLanguage.name] = (languageCounts[repo.primaryLanguage.name] || 0) + 1
      totalRepos++
    }
  })

  return Object.entries(languageCounts)
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / totalRepos) * 100),
      color: getLanguageColor(name),
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5)
}

function calculateLongestStreak(contributionDays: GitHubContribution[]) {
  let longestStreak = 0
  let currentStreak = 0
  let streakStart = ''
  let streakEnd = ''
  let currentStart = ''

  const sortedDays = contributionDays.sort((a, b) => a.date.localeCompare(b.date))

  for (let i = 0; i < sortedDays.length; i++) {
    const day = sortedDays[i]
    
    if (day.contributionCount > 0) {
      if (currentStreak === 0) {
        currentStart = day.date
      }
      currentStreak++
      
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak
        streakStart = currentStart
        streakEnd = day.date
      }
    } else {
      currentStreak = 0
    }
  }

  return {
    days: longestStreak,
    startDate: streakStart || new Date().toISOString(),
    endDate: streakEnd || new Date().toISOString(),
  }
}

function calculateMostActiveTime(contributionDays: GitHubContribution[]) {
  // This is a simplified version - in reality, we'd need commit timestamps
  // For now, we'll estimate based on weekday patterns
  const weekdayActivity = contributionDays.reduce((acc, day) => {
    acc[day.weekday] = (acc[day.weekday] || 0) + day.contributionCount
    return acc
  }, {} as Record<number, number>)

  const mostActiveWeekday = Object.entries(weekdayActivity)
    .sort(([,a], [,b]) => b - a)[0]

  // Estimate hour based on weekday (this is a placeholder)
  const estimatedHour = mostActiveWeekday ? 
    (parseInt(mostActiveWeekday[0]) === 0 || parseInt(mostActiveWeekday[0]) === 6) ? 14 : 10 : 10

  return {
    hour: estimatedHour,
    count: mostActiveWeekday ? parseInt(mostActiveWeekday[1].toString()) : 0,
  }
}

function calculateBusiestDay(contributionDays: GitHubContribution[]) {
  const busiestDay = contributionDays.reduce((max, day) => 
    day.contributionCount > max.contributionCount ? day : max
  )

  return {
    date: busiestDay.date,
    count: busiestDay.contributionCount,
  }
}

function calculateSleepEfficiency(contributionDays: GitHubContribution[]) {
  const activeDays = contributionDays.filter(day => day.contributionCount > 0)
  const averageContributions = activeDays.length > 0 ? 
    activeDays.reduce((sum, day) => sum + day.contributionCount, 0) / activeDays.length : 0

  // Estimate coding hours based on contribution intensity
  const estimatedHours = Math.min(Math.max(averageContributions * 0.5, 2), 12)

  return {
    averageHours: Math.round(estimatedHours * 10) / 10,
    pattern: estimatedHours > 8 ? 'Marathon coder' : 
             estimatedHours > 4 ? 'Steady contributor' : 'Focused sprints',
  }
}

function calculateMonthlyActivity(contributionDays: GitHubContribution[]) {
  const monthlyData: Record<string, number> = {}

  contributionDays.forEach(day => {
    const month = format(parseISO(day.date), 'MMM')
    monthlyData[month] = (monthlyData[month] || 0) + day.contributionCount
  })

  return Object.entries(monthlyData).map(([month, contributions]) => ({
    month,
    contributions,
  }))
}

function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#239120',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Dart: '#00B4AB',
    HTML: '#e34c26',
    CSS: '#1572B6',
    Shell: '#89e051',
    Vue: '#2c3e50',
    React: '#61dafb',
  }

  return colors[language] || '#8b5cf6'
}
