# Форк Mailspring без Mailspring ID

Форк [Foundry376/Mailspring](https://github.com/Foundry376/Mailspring), из которого убраны вход в
Mailspring ID, подписка Pro с квотами и облачные функции, работающие только через серверы Mailspring.

| Remote     | Адрес                                                     |
|------------|-----------------------------------------------------------|
| `origin`   | `git@github.com:etantsev/Mailspring.git`                  |
| `tantsev`  | `ssh://git@git.tantsev.ru:2222/etantsev/mailspring-fork.git` |
| `upstream` | `https://github.com/Foundry376/Mailspring.git`            |

Точка ответвления: `9a066affe` (upstream, версия 1.26.2).

## Что удалено

- **Onboarding**: страница входа (webview `id.getmailspring.com`), страница подписки, подписка на
  рассылку. После туториала сразу выбор ящика. OAuth Gmail/O365 отвечает локальной страницей.
- **Ядро** (`app/src`): `IdentityStore`, `FeatureUsageStore`, `OpenIdentityPageButton`,
  `FeatureUsedUpModal`, `Webview`, `grammar-check-plugins`, `isIdentityRequired`,
  `Actions.logoutMailspringIdentity`, `application:add-identity`, `mailspring://install-view`;
  `mailspring-api-request.ts` содержит только коды ошибок. mailsync получает identity `null`.
- **Плагины целиком**: `translation`, `composer-grammar-check`, `participant-profile`, `thread-sharing`.
- **Views**: `lib/agent`, `lib/authoring-panel`, `lib/sharing`, «Rebuild with AI».
- **Прочее**: вкладка «Подписка» в настройках, уведомление «Please subscribe», кнопка Share в
  Activity, загрузка фото подписи.
- Оставлены без квот: send-later, send-reminders, thread-snooze, open/link-tracking.

Оставлено сознательно: `SendFeatureUsageEventTask` (только для десериализации старых задач в БД),
отправка крашей на `id.getmailspring.com/report-crash` в `error-logger.js`, строки в `app/lang`.

## Обновление из upstream

```bash
git fetch upstream
git merge upstream/master
```

Конфликты ожидаемы в `onboarding`, `preferences/lib/main.tsx`, `global/mailspring-exports.*`,
`global/mailspring-component-kit.*`, `mailsync-bridge.ts`, `mailsync-process.ts`, `package-manager.ts`,
`views`. Изменения upstream в удалённых файлах — снова удалить (`git rm`).

После слияния проверить, что ничего не вернулось и не появилось нового облачного:

```bash
grep -rnE "IdentityStore|FeatureUsageStore|IIdentity|makeRequest|rootURLForServer|postStatic|isIdentityRequired|OpenIdentityPageButton|id\.getmailspring" \
  app/src app/internal_packages app/spec | grep -v /lang/
ls app/internal_packages   # новые плагины с "isIdentityRequired" или запросами к серверам Mailspring
grep -n '"electron"' package.json   # смена мажорной версии → обновить electron44 в packaging/arch
```

## Сборка

Нужен Node 22 LTS: npm 12 (Node 26) запрещает git-зависимости (`slate`, `slate-react`,
`slate-edit-list`, `debug`) и не собирает нативные модули под Electron.

```bash
npm install                        # postinstall ставит app/node_modules и скачивает mailsync
npm run typecheck && npm run lint && npm test
npm run build -- --skip-installers # → app/dist/mailspring-linux-x64/resources
```

## Установка на Arch

Пакет `mailspring-fork` заменяет AUR `mailspring-bin` (conflicts/provides) и запускается на системном
`electron44`. В AUR его нет, поэтому paru не перезаписывает сборку при обновлениях.

```bash
cd packaging/arch && makepkg -f && sudo pacman -U mailspring-fork-*.pkg.tar.zst
git push origin master && git push tantsev master
```

Если Electron в `package.json` сменил мажорную версию, обновить `electron44` в `PKGBUILD`
(`depends`) и в `mailspring.sh` (`exec electron44`).
