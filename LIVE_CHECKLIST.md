# Holtsnider Tech live checklist

Use this before merging or deploying a production change.

## Local smoke test

```powershell
git switch staging
git pull origin staging
py -m pip install -r requirements.txt
py -m flask --app app:create_app run --debug
```

Open and verify:

- http://127.0.0.1:5000/
- http://127.0.0.1:5000/static/demos/grepper.html
- http://127.0.0.1:5000/static/demos/loudsource-vote.html
- http://127.0.0.1:5000/healthz
- http://127.0.0.1:5000/robots.txt
- http://127.0.0.1:5000/sitemap.xml

## Visual checks

- Header brand is clean and does not show the old subtitle.
- Portfolio section shows Irish Today, Grepper, and LoudSource Voting Flyer.
- Irish Today uses green / white / orange.
- Grepper uses US-inspired red / white / blue.
- LoudSource uses blue / orange / white.
- Contact email links work.
- Mobile layout is readable.

## Deployment checks

- Render is pointed at the intended branch.
- Latest commit is deployed.
- Clear build cache only if assets look stale.
- Hard refresh browser after deploy.
- Verify https://holtsnidertech.com/ after deploy.
