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
- **Прочее**: вкладка «Подписка» в настройках, уведомление «Please subscribe», загрузка фото подписи.
- **Отслеживание**: плагины `open-tracking` (пиксель `link.getmailspring.com`), `link-tracking`
  (переписывание ссылок через `link.getmailspring.com`) и `activity` (дашборд и уведомления об
  открытиях/кликах) с шагом туториала, хоткеем `application:show-activity`, картинками и
  MCP-инструментами `get_message_tracking`, `list_tracked_messages`, `get_top_links`.
- **Подписи**: фото «Company / Domain Logo» (`logo.getmailspring.com`; сохранённое значение
  `company` даёт подпись без фото), иконки соцсетей с `getmailspring.com/signature-assets` —
  вместо них текстовые ссылки.
- **Телеметрия и связь с сервером**: отправка ошибок в Sentry (`sentry-error-reporter.js`, IPC
  `report-error`), crash reporter Electron на `id.getmailspring.com/report-crash`, автообновление
  (`autoupdate-*.ts`, опрос `updates.getmailspring.com`, пункты меню и уведомление об обновлении).
  Ошибки только пишутся в консоль; обновления приходят через пакет `mailspring-fork`.
- **Подпись по умолчанию** «Sent from Mailspring» — при чистой установке подписей нет.
- Оставлены без квот: send-later, send-reminders, thread-snooze.

Оставлено сознательно: `SendFeatureUsageEventTask` (только для десериализации старых задач в БД),
строки в `app/lang`, ссылки на документацию `getmailspring.com/docs` и `community.getmailspring.com`
(открываются в браузере только по клику). Плагин `remove-tracking-pixels` вырезает чужие трекеры из
входящих писем и остаётся.

## Обновление из upstream

```bash
git fetch upstream
git merge upstream/master
```

Конфликты ожидаемы в `onboarding`, `preferences/lib/main.tsx`, `global/mailspring-exports.*`,
`global/mailspring-component-kit.*`, `mailsync-bridge.ts`, `mailsync-process.ts`, `package-manager.ts`,
`views`, `error-logger.js`, `application.ts`, `application-menu.ts`, `menus/*.js`.
Изменения upstream в удалённых файлах — снова удалить (`git rm`).

После слияния проверить, что ничего не вернулось и не появилось нового облачного:

```bash
grep -rnE "IdentityStore|FeatureUsageStore|IIdentity|makeRequest|rootURLForServer|postStatic|isIdentityRequired|OpenIdentityPageButton|id\.getmailspring|Sentry|crashReporter|autoUpdater" \
  app/src app/internal_packages app/spec | grep -v /lang/
# любые обращения к серверам Mailspring, кроме ссылок на документацию
grep -rnoE "https?://[a-z0-9.-]*getmailspring\.com[^'\"\` )]*" app/src app/internal_packages \
  | grep -vE "/lang/|specs?/|fixtures|getmailspring\.com/docs|community\.getmailspring"
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
