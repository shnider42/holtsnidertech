# Client-first entrance, technical depth on request

## Scope and rollback point

Repository: `shnider42/holtsnidertech`. Working branch: `feat/site-flow-clarity`.
Pre-change checkpoint: `57c6dda88b5271d13886bdde2aec8f44ffa08868`.
The preview service `holtsnidertech-exp` tracks this branch and auto-deploys.
No merge to staging/master, production deployment, Render setting change,
DFE source change, branch deletion, or resume expansion belongs to this pass.
Revert the client-first commit(s) to recover the earlier homepage.

## Visitor structure

- `/`: one plain-language introduction and primary contact route; three selected
  examples; what happens next; direct email and optional notes.
- `/projects`: all 11 examples in the same catalogue order, without an intake flow.
- `/technical`: direct engineering background and selected implementation notes.
- `/guided`: the existing Boston guided experience, with return links. Original
  questions, context gathering, project links, experience browsing and contact
  logic remain available. Existing browser tests now enter at this route.

No technical/nontechnical audience switch, modal, mandatory questionnaire,
carousel, new JavaScript framework, or telemetry is added. The simple pages are
server-rendered Jinja templates with independent CSS, not another mutation layer
on top of the Boston scripts. Their main navigation, project links, native details
and email address work without JavaScript. The original scripts load only on
the original template and its existing related pages.

`/#work` and `/#contact` remain useful. With JavaScript, earlier `/#experience`
and `/#case-shapes` links go to `/technical`; `/#start` and `/#guided-flow` go to
`/guided`. Direct ordinary page links remain available without JavaScript.

## Content source

One JSON catalogue powers the simple homepage, full gallery, technical examples,
and both guided Build/Improve paths. Selected project IDs live in
`app/showcase.py`. The original 11 identities, source relationships and launch
URLs are preserved. The selected project technical paragraphs describe actual
implementation choices and limitations, not invented client outcomes. Engineering
background is adapted from the existing site, not a new resume or certification.

## Contact behavior

The prominent first-screen action goes straight to the visible contact section.
Email Chris is an ordinary mailto link and explicitly opens the user's email app.
It never claims an email was sent. The address remains visible and selectable.
Optional notes update a read-only, selectable draft in this page. No notes are
stored in localStorage or sent to a backend. Only the existing color preference
uses storage. A blocked Clipboard API selects the actual text and explains manual
copy instead of claiming success. Long drafts remain fully copyable while the
mailto link omits the body; an adjacent notice explains that fallback.
Without JavaScript, the email address and starter draft remain usable and the
notes section explains how to copy/edit the message in the user's email app.

## Validation

The existing guided and Grepper tests remain; the guided fixture's entry URL is
changed from `/` to `/guided`. New tests target the actual new homepage and check
3 selected / 11 total projects, one-click technical navigation, optional guided
access, native details, keyboard and no-JavaScript behavior, long draft handling,
clipboard denial/unavailability, blocked storage, mobile layouts, and deep links.
Screenshots come from the actual Flask pages in CI. Local static-template checks
are narrower and must not be described as the full site suite.

Before merging, have a nontechnical prospect explain what Chris can help with
and how to contact him, and have a technical prospect find relevant engineering
evidence. Passing automated tests does not establish that the positioning is
right or that real prospects will find the experience less overwhelming.
