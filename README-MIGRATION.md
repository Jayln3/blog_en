# Jayln3 English blog migration

The active bilingual site is now maintained in the source branch of
<https://github.com/jayln3/jayln3.github.io>.

English homepage: <https://jayln3.github.io/en/>.

This repository retains the old Stellar/Hexo sources for reference. The deployment
workflow only generates the redirects defined in migration/routes.json. It does
not build or publish the old dependency tree, public directory or sample pages.

The old Hello World URL points to the new welcome article. Empty sample project,
wiki and social pages point to the new about page. Archives, categories and tags
point to the corresponding English indexes.

Run node migration/build.mjs to inspect the generated redirects locally.
