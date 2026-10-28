# DeepSeek Chat

Адаптивный русскоязычный AI-чат на HTML/CSS/JavaScript с серверным прокси Cloudflare Workers.

## Файлы
- `index.html`, `style.css`, `app.js` — интерфейс.
- `worker/worker.js` — защищённый серверный запрос к DeepSeek API.
- `worker/wrangler.toml` — конфигурация Worker.

## Подключение API
1. Создай API-ключ в [DeepSeek Platform](https://platform.deepseek.com/).
2. Разверни `worker/worker.js` как Cloudflare Worker.
3. В Worker → Settings → Variables and Secrets добавь секрет `DEEPSEEK_API_KEY` со своим ключом. Не публикуй ключ в GitHub и не помещай его в браузер.
4. В `app.js` замени адрес `YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev` на адрес своего Worker.
5. В GitHub открой Settings → Pages → Deploy from a branch → `main` → `/(root)` → Save.

API может требовать отдельного баланса; подписка на сайт DeepSeek не равна API-балансу.

## Важно
Перед публичным использованием ограничь CORS в Worker своим доменом GitHub Pages и добавь rate limiting/контроль расходов. История чатов хранится в localStorage браузера.
