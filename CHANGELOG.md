# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0](https://github.com/bgd-labs/adi-dashboard/compare/v1.1.0...v1.2.0) (2024-03-15)


### Features

* add basic filtering from/to ([794fd2a](https://github.com/bgd-labs/adi-dashboard/commit/794fd2ad6bc7a45d9466b1236062c7cee37f8717))
* add consensus and timestamp info to details ([8404062](https://github.com/bgd-labs/adi-dashboard/commit/8404062e3c8c4dac38c39c4e3be7debe8b591e63))
* add delivery status in details ([6e438a8](https://github.com/bgd-labs/adi-dashboard/commit/6e438a846425a97df82ea38cbeaf756188c0e3e9))
* add Envelope filters ([d7ba6e5](https://github.com/bgd-labs/adi-dashboard/commit/d7ba6e547b7b1851581bc0cf6ec31fec5fce512c))
* add fetch revalidation ([0a8557a](https://github.com/bgd-labs/adi-dashboard/commit/0a8557ab35c6716eb5d096358f461425fe2e36a8))
* add filtering by payloadId and proposalId ([e051b67](https://github.com/bgd-labs/adi-dashboard/commit/e051b67ded084b3b69866d94c8e784b964cfdba3))
* add new filter layout ([cf81448](https://github.com/bgd-labs/adi-dashboard/commit/cf81448ea3abb1d869b044835d66d217e91083b3))
* add placeholder to Consensus ([a4d98d7](https://github.com/bgd-labs/adi-dashboard/commit/a4d98d78deaeaaa2b935013da426cddff781826d))
* debounce values ([8f501f8](https://github.com/bgd-labs/adi-dashboard/commit/8f501f8ed98aa270b69d98aeb82872a921bb1b2b))
* handle input change ([ca4b624](https://github.com/bgd-labs/adi-dashboard/commit/ca4b6245f57a1fbef1e86411641e8322f1d1129d))
* store proposal/payload info in DB ([0110ad4](https://github.com/bgd-labs/adi-dashboard/commit/0110ad4f3d7522109a5e97353cd99d18c13f87be))
* truncate to two significant digits ([69cc45c](https://github.com/bgd-labs/adi-dashboard/commit/69cc45c4bc5d2d2b0cf003d943fa4bd10423234d))
* update skeleton ([52f2ae1](https://github.com/bgd-labs/adi-dashboard/commit/52f2ae123484eada3d498cfc8708024d851fc7ae))


### Bug Fixes

* don't add a placeholder on event detail ([d52171b](https://github.com/bgd-labs/adi-dashboard/commit/d52171bad32365915da6a61605954afcac1b448b))
* ensure IDs are numbers ([419df41](https://github.com/bgd-labs/adi-dashboard/commit/419df414e3fe1bcc9be21a5f705f885ff2fa837f))
* fix linting errors ([806efb4](https://github.com/bgd-labs/adi-dashboard/commit/806efb4d683e12f5a3d958054d1685e5337871cf))
* print error ([3a47694](https://github.com/bgd-labs/adi-dashboard/commit/3a4769446cef600052bd38c4b2c9c5489165d544))
* use supabaseAdmin ([f46db8f](https://github.com/bgd-labs/adi-dashboard/commit/f46db8f93146965ea33c1c6e8a57048cc2272665))
* wrap costs calc in try/catch ([23a8b0e](https://github.com/bgd-labs/adi-dashboard/commit/23a8b0e022c7f47e3c97a3425b3a5f9565912652))

## 1.1.0 (2024-03-11)


### Features

* add "tiny" variation of ExplorerLink ([d9e350d](https://github.com/bgd-labs/adi-dashboard/commit/d9e350df2e9b7b28a3a76f8942aeb10389c016f9))
* add Bridge explorer links ([8738cfa](https://github.com/bgd-labs/adi-dashboard/commit/8738cfa86e6ffe4bab3dda9c6b8f8135867d1dc5))
* add celo icon ([e9e65e5](https://github.com/bgd-labs/adi-dashboard/commit/e9e65e59427b50a717af4ce627c5d2f22ff4c345))
* add coingecko attribution ([85a038d](https://github.com/bgd-labs/adi-dashboard/commit/85a038d6c377b12df72cfe7bb81ff307cede2397))
* add cron for tx costs checking ([ff7019c](https://github.com/bgd-labs/adi-dashboard/commit/ff7019c11886a00448b13ca2f4d84f9d22cdf744))
* add new env varss ([cfea685](https://github.com/bgd-labs/adi-dashboard/commit/cfea6858e67834387f8144e8a17b25ea19b5d6d7))
* add preprod label ([25de0f1](https://github.com/bgd-labs/adi-dashboard/commit/25de0f11d119e96ba708184adbe5fef78e55f157))
* add priority to the logo ([edc0b61](https://github.com/bgd-labs/adi-dashboard/commit/edc0b61632a2c2be3ca1f4998b30ef4b19fc0810))
* add transactions endpoint ([e8c2039](https://github.com/bgd-labs/adi-dashboard/commit/e8c203929e2a5e6c6198ae3e129d57b7853424e3))
* add transactions endpoint to router ([07916a0](https://github.com/bgd-labs/adi-dashboard/commit/07916a0959eef1c2181f889c09b2b00403aab083))
* add unused tx endpoint ([076ad53](https://github.com/bgd-labs/adi-dashboard/commit/076ad53ccd9ee457ebb7435d681bcbd7a6de4408))
* address case-insensitive select ([d6c999f](https://github.com/bgd-labs/adi-dashboard/commit/d6c999f83f76b16080429c3f02f43de99b707602))
* collect cost data for events ([7a29f65](https://github.com/bgd-labs/adi-dashboard/commit/7a29f6579974e02fb9c6d869885ed09372c399c4))
* collect tx costs info ([53e7dda](https://github.com/bgd-labs/adi-dashboard/commit/53e7ddaef8c8480694b3995d135f68a1a7776083))
* display tx costs associated with Envelope ([0249635](https://github.com/bgd-labs/adi-dashboard/commit/0249635046f5a00fa09fc4492c3f02eb410c3872))
* increase timeout for "Skipped" status ([a08b863](https://github.com/bgd-labs/adi-dashboard/commit/a08b863423d16346aeca62f3950fe15dcaed2e58))
* show LINK balance ([2fd711e](https://github.com/bgd-labs/adi-dashboard/commit/2fd711e35b08053f246e4c81516c53435d556d1d))
* show native token balances ([3140db4](https://github.com/bgd-labs/adi-dashboard/commit/3140db42606e34c04589da4540d55dd6fea7f84c))
* show token symbol instead of name ([7399ee1](https://github.com/bgd-labs/adi-dashboard/commit/7399ee1a41d2ce6b68be8188e4c0678e8d75feb3))
* update balance display ([8c72173](https://github.com/bgd-labs/adi-dashboard/commit/8c721733ffd0019b23c6ebd681b35913893cfaa7))
* update database schema ([88953b8](https://github.com/bgd-labs/adi-dashboard/commit/88953b8fb2d785cdba18b63c43e1e8cf1a677f18))
* update slack urls for preprod ([f7cbe89](https://github.com/bgd-labs/adi-dashboard/commit/f7cbe892f8a07a141c802edac8e5dd0f1bd946c0))


### Bug Fixes

* fix color on skeleton loader ([4a7a5ef](https://github.com/bgd-labs/adi-dashboard/commit/4a7a5ef159bea303ecf2586e57a19b14c0053e77))
* fix linting errors ([e7fb516](https://github.com/bgd-labs/adi-dashboard/commit/e7fb516858c367b50280793527e26400c4d3ec56))
* show "success" instead of "pending" ([f8b16f1](https://github.com/bgd-labs/adi-dashboard/commit/f8b16f12c09ee5cf225b1a82d51065d92b6bdfbd))
