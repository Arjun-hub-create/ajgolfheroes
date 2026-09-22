# AJGolfHeroes

AJGolfHeroes is a golf membership platform with a simple idea behind it.

You play golf. You join as a member. You pick a charity you actually care about. A slice of your subscription goes to that charity every month. Your golf scores also put you in a monthly prize draw, so the rounds you already play can win you money too.

That’s it. Golf, giving, and a monthly draw. Not a random lottery ticket you buy and forget. Your numbers come from real Stableford scores after real rounds.

The tagline on the site is **Play golf. Change lives. Win big.** That’s the whole product in one line.

---

## Why this exists

A lot of golfers play every week and never do anything with those scores except argue about them in the clubhouse. At the same time, a lot of people want to support charity but never quite get around to it.

This app ties those two things together.

You subscribe once. You choose a cause. You keep logging scores like you already would. Every month, five numbers get drawn. If your scores match, you win a share of the prize pool. If they don’t, your charity still got paid. Nobody’s round was wasted.

The more members join, the bigger the pool gets, and the more money goes out to Indian charities.

---

## How a member uses it, start to finish

This is the full loop, in the order a real person would actually do it.

### 1. Land on the home page

The home page is the pitch. Dark layout, big headline, short explanation, and a few numbers up top (members, money donated, this month’s prize pool, that kind of thing).

It walks through three steps:

1. Subscribe and pick a charity
2. Enter your scores after each round
3. Wait for the monthly draw and see if you matched

From here you can start a membership, browse charities, or log in if you already have an account.

### 2. Create an account or log in

There is one login page with two modes: **sign in** and **sign up**.

For sign up you enter your full name, email, and password. The app creates the account through Supabase Auth. You may need to confirm your email depending on how the backend is set up.

For sign in you just use email and password. If it works, you get sent straight to the dashboard.

If you are already logged in and you hit the login page again, it just takes you to the dashboard. No point sitting on a form you don’t need.

Passwords are not stored in the frontend. Supabase handles that on the server.

### 3. Subscribe

This is a four-step flow, not a giant form dump.

**Step 1 — Pick a plan**

- Monthly: **₹800 / month**
- Yearly: **₹7,680 / year** (that’s 20% off, save ₹1,920)

Both plans get you into the platform, the monthly draw, score tracking, charity contribution, and winner checks. Yearly also gets the nicer extras (priority support, earlier draw results, yearly stats, yearly badge).

**Step 2 — Pick a charity**

You choose who your membership supports. The live list comes from the database when you reach this step. The ones the product is built around include:

- Cancer Research India
- AJ Cancer Foundation
- Arjun Heart Foundation
- Age India

You also set how much of your subscription goes to charity. The floor is **10%**. You can go higher if you want (up to 50% in the flow).

**Step 3 — Payment**

You fill in card details. Stripe is already in the project for later. Right now this step **simulates payment** so you can walk through the whole membership flow without a live charge.

**Step 4 — Done**

If it saves, you now have an active subscription tied to you, your plan, your charity, and the percentage you chose.

Dashboard and subscribe pages need you to be logged in. If you try to pay without an account, it asks you to sign in first.

### 4. Use the dashboard

This is home base after you join.

You can:

- See your name / profile
- See whether your subscription is active, which plan you’re on, and which charity you picked
- Add a new Stableford score (the number, plus the date you played)
- Edit or delete a score if you typed it wrong
- See simple stats like average score and best score

Scores have to be **between 1 and 45**. That’s the range the draw uses. If you type something outside that, it won’t save.

Those scores are what the monthly draw compares against. You are not picking lucky numbers. You are entering golf scores.

### 5. Browse charities

The charities page is a public gallery. You can search by name or category (health, elderly, mental health, housing, and so on).

Each card shows:

- Name
- What they do
- Category
- How much has been raised
- How many supporters

The idea is: before you subscribe, you can actually look at who you’re supporting instead of ticking a random box.

### 6. Check the monthly draw

The draw page shows the current month’s published draw.

You’ll see:

- The month and year
- The five drawn numbers
- The prize pool
- Whether **your** scores matched, and which prize tier that is (if you’re logged in and have scores)
- Older published draws if you open the past-draws section

There is also a **simulate draw** button so you can see the animation and the matching logic without waiting for an official publish. That’s for demo / preview. The real public result is whatever an admin has published.

Matching is simple:

- Compare your score numbers with the five draw numbers
- Count how many overlap
- 3, 4, or 5 matches = a prize tier
- Anything under 3 = no prize for that draw

### 7. Admin side (not for normal members)

There is an admin page. You only get in if your profile is marked as admin. Everyone else gets bounced.

From there an admin can:

- See totals: users, active subscriptions, prize pool, charity amount
- Look at users, winners, and charities
- Run a draw (random, or weighted off scores)
- Publish a draw so it shows up on the public draw page
- Work with winner records

That’s how a month actually “closes”: admin runs numbers, publishes them, members see them, matches get recorded.

---

## How the money is meant to work

This is the split the product is built around.

Out of subscription money:

- About **60%** is aimed at the **prize pool**
- At least **10%** goes to the member’s **chosen charity** (they can choose more)
- The rest is platform / running the thing

Inside the prize pool, winning tiers are:

| Match | What it means | Share of the pool |
|---|---|---|
| 5 numbers | Jackpot | 40% (plus any jackpot that rolled over) |
| 4 numbers | Second | 35% |
| 3 numbers | Third | 25% |

If nobody hits the jackpot, that jackpot piece can roll into the next month. That’s why a quiet month can make the next one bigger.

More members → more subscription money → bigger pool and more charity going out. That’s the flywheel.

---

## How the draw actually thinks

Every draw is **five different numbers**, each from **1 to 45**, then sorted.

Two styles exist in the engine:

- **Random** — pick five unique numbers in that range
- **Weighted** — numbers that show up more often in members’ scores are a bit more likely to appear

Then matching is just: how many of *your* score values sit inside those five numbers?

Your last scores are your ticket. Log five scores over the month, and those are the numbers sitting in the drum.

---

## Pages in the app

| Page | Who it’s for | What it does |
|---|---|---|
| `/` Home | Everyone | Explains the product and gets people to join |
| `/login` | Everyone | Sign in or create an account |
| `/subscribe` | Members | Plan → charity → payment → success |
| `/dashboard` | Logged-in members | Scores, profile, subscription, charity |
| `/charities` | Everyone | Browse / search who the money supports |
| `/draw` | Everyone | Latest draw, match check, past draws, simulate |
| `/admin` | Admins only | Stats, run/publish draws, users, winners |

The bar at the top is always there. Login state changes what you can open. Dashboard needs a logged-in user. Admin needs a logged-in admin.

---

## What’s under the hood (in normal words)

This is a **frontend app**. There is no custom Node/Express server in this repo.

The browser talks to **Supabase** for:

- Accounts (sign up, login, session)
- The database (profiles, subscriptions, scores, draws, winners, charities)
- Making sure people mostly only touch their own data

Tech stack:

- **React 19** — the UI
- **Vite** — run it locally and build it for production
- **React Router** — all the pages above
- **Tailwind** — the dark golf-club look
- **Framer Motion** — the motion on pages
- **Zustand** — small global auth state
- **Supabase** — backend
- **Stripe.js** — payments, ready to plug in properly later
- **date-fns** — dates on draws and scores
- **Vercel** — routing is set up for deploy

The important folders:

- `src/pages/` — the actual screens
- `src/components/` — shared bits (navbar is the main one that’s fully used)
- `src/hooks/` — login session, scores, draws
- `src/lib/` — Supabase client, draw math, prize-pool math, Stripe loader
- `src/store/` — auth (and a subscription store that’s there for later)

On the database side, the main tables are:

- **profiles** — name, email, whether someone is admin
- **subscriptions** — plan, status, charity, charity %, amount
- **scores** — each round you logged (1–45, plus the date)
- **draws** — the five numbers, prize amounts, published or not, random vs weighted
- **winners** — who matched, which tier, how much, paid or not
- **charities** — the causes you can support

Login uses a session token from Supabase. The app does not hash passwords itself. Row-level security on Supabase is meant to keep people in their own scores. Admin is a flag on the profile, checked before the admin screen loads.

---

## What is real today vs what is still simulated

**Working now**

- Full UI and member journey
- Sign up / login
- Subscribe wizard
- Dashboard score tracking
- Charities page
- Draw page with matching
- Admin draw + publish flow
- Prize-pool and match math

**Not fully live yet**

- Card payment is a **simulation** so you can demo the flow
- Stripe is in the repo but not charging for real on the subscribe page
- Some smaller UI components are placeholders because the pages already do that work themselves

This is a complete product demo / frontend with a real Supabase backend, not a fake slideshow. Payments are the main piece still in “walk through it” mode.

---

## Run it on your machine

You need **Node.js** installed.

```bash
git clone https://github.com/Arjun-hub-create/ajgolfheroes.git
cd ajgolfheroes
npm install
```

Make a `.env` file in the project root. Do **not** commit this file. Git already ignores it.

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

Then:

```bash
npm run dev
```

Vite will print a local URL, usually `http://localhost:5173`. Open that.

Useful scripts:

- `npm run dev` — local site with hot reload
- `npm run build` — production build
- `npm run preview` — preview that production build
- `npm run lint` — lint check

You also need a Supabase project with the tables above, plus at least one profile with `is_admin = true` if you want to open `/admin`.

---

## A normal month on the platform

1. A golfer joins and picks Cancer Research India at 10%.
2. They play four weekends and log four Stableford scores.
3. Those scores sit on their dashboard.
4. End of the month, an admin runs and publishes the draw.
5. The golfer opens the draw page. Maybe they matched 3 numbers. That’s the third-place tier.
6. Charity still received its cut from the subscription whether they won or not.
7. If nobody hit 5 numbers, the jackpot piece can sit there for next month.

That’s the product. Not complicated. Just golf scores with something riding on them, and a charity attached to the membership.

---

## Repo

GitHub: [https://github.com/Arjun-hub-create/ajgolfheroes.git](https://github.com/Arjun-hub-create/ajgolfheroes.git)

Built as **AJGolfHeroes** / golf-platform.
