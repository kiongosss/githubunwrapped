require('dotenv').config();
const { Octokit } = require('@octokit/rest');

class GitHubWrapped {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    this.username = '';
    this.currentYear = new Date().getFullYear();
  }

  async init() {
    try {
      // Get authenticated user
      const { data: user } = await this.octokit.users.getAuthenticated();
      this.username = user.login;
      
      console.log(`\n🎉 Welcome to your GitHub Wrapped ${this.currentYear}, ${this.username}!\n`);
      
      await this.getUserStats();
      await this.getRepoStats();
      await this.getCommitStats();
      await this.getPullRequestStats();
      await this.getContributionStats();
      
      console.log('\n✨ Your GitHub year in review is complete! 🎉\n');
      
    } catch (error) {
      console.error('Error:', error.message);
      if (error.status === 401) {
        console.error('Please check your GitHub token and make sure it has the correct permissions.');
      }
    }
  }

  async getUserStats() {
    const { data: user } = await this.octokit.users.getByUsername({
      username: this.username,
    });
    
    console.log('👤 Your GitHub Stats:');
    console.log('-------------------');
    console.log(`🌟 Stars Received: ${user.stargazers_count || 0}`);
    console.log(`👥 Followers: ${user.followers}`);
    console.log(`📌 Public Repos: ${user.public_repos}`);
    console.log('');
  }

  async getRepoStats() {
    const { data: repos } = await this.octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });

    const thisYearRepos = repos.filter(repo => {
      const createdAt = new Date(repo.created_at);
      return createdAt.getFullYear() === this.currentYear;
    });

    const starredRepos = repos.filter(repo => repo.stargazers_count > 0);
    const mostStarredRepo = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];

    console.log('📊 Repository Stats:');
    console.log('-------------------');
    console.log(`📂 Total Repositories: ${repos.length}`);
    console.log(`🆕 Created in ${this.currentYear}: ${thisYearRepos.length}`);
    console.log(`⭐ Starred Repositories: ${starredRepos.length}`);
    if (mostStarredRepo) {
      console.log(`🏆 Most Starred Repo: ${mostStarredRepo.name} (${mostStarredRepo.stargazers_count} stars)`);
    }
    console.log('');
  }

  async getCommitStats() {
    const { data: events } = await this.octokit.activity.listEventsForAuthenticatedUser({
      username: this.username,
      per_page: 100,
    });

    const pushEvents = events.filter(event => event.type === 'PushEvent');
    const commitCount = pushEvents.reduce((acc, event) => {
      return acc + (event.payload.commits ? event.payload.commits.length : 0);
    }, 0);

    console.log('💾 Code Contributions:');
    console.log('-------------------');
    console.log(`📝 Total Commits (estimated): ${commitCount}`);
    console.log(`🚀 Push Events: ${pushEvents.length}`);
    console.log('');
  }

  async getPullRequestStats() {
    const { data: prs } = await this.octokit.search.issuesAndPullRequests({
      q: `is:pr author:${this.username} created:${this.currentYear}-01-01..${this.currentYear}-12-31`,
      per_page: 1,
    });

    console.log('🔧 Pull Requests:');
    console.log('----------------');
    console.log(`📤 PRs Opened in ${this.currentYear}: ${prs.total_count}`);
    console.log('');
  }

  async getContributionStats() {
    const { data: contributions } = await this.octokit.request('GET /users/{username}/events/public', {
      username: this.username,
      per_page: 100,
    });

    const contributionTypes = {};
    contributions.forEach(event => {
      contributionTypes[event.type] = (contributionTypes[event.type] || 0) + 1;
    });

    console.log('📈 Contribution Breakdown:');
    console.log('------------------------');
    Object.entries(contributionTypes).forEach(([type, count]) => {
      console.log(`- ${type}: ${count} times`);
    });
  }
}

// Run the GitHub Wrapped
const githubWrapped = new GitHubWrapped();
githubWrapped.init();
