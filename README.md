# redirector
![Twitter Follow](https://img.shields.io/twitter/follow/seeleftmagazin?label=%2Fseeleftmagazin&style=social) ![Discord](https://img.shields.io/discord/600328651124506625?style=social) ![GitHub](https://img.shields.io/github/license/seeleft/redirector) ![GitHub top language](https://img.shields.io/github/languages/top/seeleft/redirector) ![GitHub last commit](https://img.shields.io/github/last-commit/seeleft/redirector) ![GitHub commit activity](https://img.shields.io/github/commit-activity/w/seeleft/redirector) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/c979d5df2f9d4d478058e36ab2e966c5)](https://www.codacy.com/app/syntax-yt/redirector?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=seeleft/redirector&amp;utm_campaign=Badge_Grade) ![AppVeyor tests](https://img.shields.io/appveyor/tests/syntax-yt/redirector) ![AppVeyor](https://img.shields.io/appveyor/ci/syntax-yt/redirector) ![GitHub release](https://img.shields.io/github/release/seeleft/redirector)

---

> ## ⚠️ Disclaimer
> ### This project is in **very early** development, so don't expect great or even rely on it in production use.
> ### Furthermore was this piece of software originally written in aid of the [seeleft.de magazine](https://seeleft.de) and was **never meant to be opensourced**.

---

> ## 💿 Prerequisites
> - [NodeJS](https://nodejs.org) >= 6.0 and [npm](https://www.npmjs.com)
> - A [MongoDB](https://www.mongodb.com) database (you can get one completly **free** at [devstorage.eu](https://panel.devstorage.eu))

---

> ## 📲 Installation
> ### Build from source (bleeding edge)
> - Install [git](https://git-scm.com) if not already done
> - Clone the repository: `git clone https://github.com/seeleft/redirector.git`
> - Install dependencies: `npm install`
> - Build from sources: `npm run dev:build` (if everything went good, the built project files are stored in `/dist/`)
> - Edit `config.toml` to your needs
> - Start the server: `npm start`
>
> ### ~~Use release build~~ (atm. no releases)
> - Click [here](https://github.com/seeleft/redirector/releases) to download the latest release
> - Install dependencies: `npm install`
> - Edit `config.toml` to your needs
> - Start the server: `npm start`

---

> ## 🛠️ Development setup
> - Install [git](https://git-scm.com) if not already done
> - Click [here](https://github.com/seeleft/redirector/fork) to fork the repository
> - Create a local development configuration which's values will override the normal config one's (ignored by git): `touch config.debug.toml`
> - Clone the forked repository: `git clone https://github.com/{YOUR GITHUB NAME}/redirector.git`
> - Install dependencies: `npm install`
> - Make your changes to the sourcecode and submit a pull request

---

> ## ⚙️ Configuration "crash-course"
> - Config file under `./config.toml`
> - Config using [Tom's Obvious, Minimal Language](https://github.com/toml-lang/toml)
> - Example with the database section of the config:
> ```TOML 
> [database]
>    type = 'mongodb'
>    uri = 'mongodb://user:password@host:port/database'
>    options = { useNewUrlParser = true }