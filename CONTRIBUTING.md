# Contributing Guidelines

Thank you for your interest in contributing. Please read these rules carefully before submitting any changes.

## Authorization Required

* Contributions are restricted to authorized contributors only. We are currently not accepting external contributions.

## Branching Rules

* Every feature or fix should be developed in a separate branch.
* The branch should be named `feature/<issue-number>-<branch-name>` example `feature/6-frontend-folder-init`
* All changes to the main branch should go through a Pull Request to be peer reviewed.
* Pull Requests should be linked to an existing issue.

## Kanban workflow

* While working on an issue, keep its Kanban status updated.
* When an issue is peer reviewed and closed:
  * Move the issue to **Done**
  * Fill in the `Time Spent (h)` label
  * Move any backlog issues that can now be worked on to **Ready**
 
## Example workflow

* Take the `Backend initial commit #2` issue from **Ready** to **In progress**
* `git checkout main`
* `git pull`
* `git checkout -b feature/2-backend-initial-commit`
* Repeat as needed
  * make changes
  * `git add .`
  * `git commit -m "Backend initial commit (#2)"`
  * `git push -u origin feature/2-backend-initial-commit`
* When done with the branch go to Github and open a pull request
* Fill in Reviewers and Assignees if needed
* Add `Closes #2` to PR description
* Create pull request
* Move issue to **In review**
* Once pull request is accepted:
  * Move issue to **Done**
  * Fill in the `Time Spent (h)` label
  * Move any backlog issues that can now be worked on to **Ready**

