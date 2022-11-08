const core = require("@actions/core");
const github = require("@actions/github");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
    const owner =
      core.getInput("owner") ||
      (process.env.GITHUB_REPOSITORY || "").split("/")[0];
    const repo =
      core.getInput("repo") ||
      (process.env.GITHUB_REPOSITORY || "").split("/")[1];
    const head = core.getInput("source-branch");
    const base = core.getInput("target-branch");
    const commit_message =
      core.getInput("commit-message") || `Automatic Merge - ${head} -> ${base}`;
    const octokit = github.getOctokit(GITHUB_TOKEN);

    const res = await octokit.repos.merge({
      owner,
      repo,
      base,
      head,
      commit_message,
    });

    if (res && res.data) {
      switch (res.status) {
        case 201:
          core.info(`Merged ${head} -> ${base} (${res.data.sha || ""})`);
          break;

        case 204:
          core.info(
            "Target branch already contains changes from source branch. Nothing to merge"
          );
          break;

        case 409:
          core.setFailed(`Merge conflict. ${res.data.message || ""}`);
          break;

        case 404:
          core.setFailed(`Branch not found. ${res.data.message || ""}`);
          break;

        default:
          core.warning(
            `Merge action has completed, but with an unknown status code: ${res.status}`
          );
      }
    } else {
      return core.setFailed(
        "An unknown error occurred during merge operation (empty response)"
      );
    }

    core.setOutput("time", new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
