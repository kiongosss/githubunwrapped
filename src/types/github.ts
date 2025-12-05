export interface GitHubStats {
  totalContributions: number
  topLanguage: {
    name: string
    percentage: number
  }
  longestStreak: {
    days: number
    startDate: string
    endDate: string
  }
  mostActiveTime: {
    hour: number
    count: number
  }
  commitTypeBreakdown: {
    commits: number
    pullRequests: number
    issues: number
    reviews: number
  }
  busiestDay: {
    date: string
    count: number
  }
  sleepEfficiency: {
    averageHours: number
    pattern: string
  }
  monthlyActivity: Array<{
    month: string
    contributions: number
  }>
  languageStats: Array<{
    name: string
    percentage: number
    color: string
  }>
  user: {
    login: string
    name: string
    avatarUrl: string
    createdAt: string
  }
}

export interface GitHubContribution {
  date: string
  contributionCount: number
  weekday: number
}

export interface GitHubRepository {
  name: string
  primaryLanguage?: {
    name: string
    color: string
  }
  stargazerCount: number
  forkCount: number
  createdAt: string
  updatedAt: string
}

export interface GitHubCommit {
  committedDate: string
  message: string
  repository: {
    name: string
  }
}

export interface GitHubPullRequest {
  createdAt: string
  mergedAt?: string
  state: string
  repository: {
    name: string
  }
}

export interface GitHubIssue {
  createdAt: string
  closedAt?: string
  state: string
  repository: {
    name: string
  }
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}
