const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const github_token = core.getInput("github_token");
    const head = core.getInput("source");
    const base = core.getInput("target");
    const commit_message =
      core.getInput("commit_message") ||
      `🤖 Automatic Merge - ${head} -> ${base}`;

    if (!github_token) {
      return core.setFailed("github_token was not specified");
    }

    const octokit = github.getOctokit(github_token);
    const owner = (process.env.GITHUB_REPOSITORY || "").split("/")[0];
    const repo = (process.env.GITHUB_REPOSITORY || "").split("/")[1];

    if (!owner) {
      return core.setFailed(
        `Owner of the repository was not specified and could not be derived from GITHUB_REPOSITORY env variable (${process.env.GITHUB_REPOSITORY})`
      );
    }

    if (!repo) {
      return core.setFailed(
        `Repository name was not specified and could not be derived from GITHUB_REPOSITORY env variable (${process.env.GITHUB_REPOSITORY})`
      );
    }

    let status = "error";

    const res = await octokit.rest.repos.merge({
      owner,
      repo,
      base,
      head,
      commit_message,
    });

    if (res) {
      switch (res.status) {
        case 201:
          core.info(`Merged ${head} -> ${base} (${res.data.sha || ""})`);
          status = "success";
          break;

        case 204:
          core.info(
            "Target branch already contains changes from source branch. Nothing to merge"
          );
          status = "success";
          break;

        case 409:
          core.setFailed(`Merge conflict. ${res.data.message || ""}`);
          status = "failure";
          break;

        case 404:
          core.setFailed(`Branch not found. ${res.data.message || ""}`);
          status = "failure";
          break;

        default:
          core.warning(
            `Merge action has completed, but with an unknown status code: ${res.status}`
          );
          status = "warning";
      }
    } else {
      return core.setFailed(
        "An unknown error occurred during merge operation (empty response)"
      );
    }

    core.setOutput("status", status);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
