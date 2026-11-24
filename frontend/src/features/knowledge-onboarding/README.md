# Make files searchable

An optional upload panel for Ignite's existing Knowledge page. It uses the
workspace's current indexing settings. With embeddings enabled, uploads can
be searched by meaning. Otherwise, uploads use keyword search.

## Fetch the feature directory

Run this in a sibling directory to your existing Ignite checkout:

```sh
git clone --filter=blob:none --single-branch --branch feature/knowledge-onboarding \
  --no-checkout https://github.com/Pradeeprajagopal18/ignite.git ignite-onboarding
git -C ignite-onboarding sparse-checkout init --no-cone
git -C ignite-onboarding sparse-checkout set '/frontend/src/features/knowledge-onboarding/'
git -C ignite-onboarding checkout feature/knowledge-onboarding
```

Only the feature directory is materialized in the sparse worktree. Git still
fetches the metadata it needs for the selected branch.

## Install into your existing checkout

Copy `frontend/src/features/knowledge-onboarding/` from the sparse checkout
to the same path in your existing checkout. For future updates, review the
directory diff before copying over your installed files.

From the existing checkout's root, run:

```sh
git apply --check frontend/src/features/knowledge-onboarding/integrate.patch &&
git apply frontend/src/features/knowledge-onboarding/integrate.patch
```

The patch imports `MakeSearchable` and renders it above the workspace's
`TryIt` panel in `frontend/src/knowledge.tsx`. If the check fails because
you edited that area, add those two lines from the patch manually where they
fit your page. The patch requires Ignite's existing Knowledge API and UI.

In Knowledge, select files, optionally limit access by group or deselect
files, then click **Make searchable**. The source opens after indexing so
you can try a question. Existing connector setup is available under **Add
a source**.
