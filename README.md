<div align="center">
  <a href="https://flowers.sylvain.sh"><img src="https://flowers.sylvain.sh/favicon.ico" alt="Logo" width="25%" height="auto"/></a>

# Flowers - Real-time Data Viewer

[![Version](https://custom-icon-badges.demolab.com/badge/Version%20:-v1.0.1-6479ee?logo=flowers.sylvain.sh&labelColor=23272A)](https://github.com/20syldev/flowers/releases/latest)

</div>

---

## About

A real-time data viewer for any JSON API, available at **[flowers.sylvain.sh](https://flowers.sylvain.sh)**.

Connect any JSON endpoint and watch your data stream in. Auto-detection, advanced filters, adapts to your schema.

## Features

- **Real-time** — Automatic polling with configurable interval. Your data updates continuously.
- **Auto-detection** — Automatic recognition of field types: status, method, URL, timestamp, duration...
- **Advanced filters** — Filter by status codes, HTTP methods, or free text. Combine filters as you wish.
- **Presets** — Save your favorite configurations and switch between them in one click.
- **Comparison** — Select two entries and visualize differences side by side.
- **Import / Export** — Export your data and settings, or import them on another browser.

## Usage

1. **Connect** — Enter the URL of any JSON API endpoint.
2. **Observe** — Flowers polls the endpoint and streams data in real time.
3. **Customize** — Filter, sort, and adjust the layout to suit your needs.

## JSON format

Flowers works with any JSON response. It auto-detects field types based on common naming conventions. Your API can return an array of objects or a single object.

```json
[
    {
        "status": 200,
        "method": "GET",
        "url": "/api/users",
        "timestamp": 1710000000000,
        "duration": "45ms",
        "source": "nginx"
    }
]
```

Recognized field types by keyword:

| Field         | Keywords                                                                              |
| ------------- | ------------------------------------------------------------------------------------- |
| **Timestamp** | timestamp, time, date, created, createdAt, created_at, updated, updatedAt, updated_at |
| **Status**    | status, statusCode, status_code, code, httpStatus, http_status                        |
| **Method**    | method, httpMethod, http_method, verb, action                                         |
| **URL**       | url, path, endpoint, route, uri, request, href                                        |
| **Category**  | type, category, kind, level, severity, tag, label                                     |
| **Source**    | source, origin, platform, agent, client, user_agent, userAgent, from, ip              |
| **Duration**  | duration, elapsed, latency, responseTime, response_time, ms, took                     |
| **Message**   | message, msg, text, description, body, content, error, reason, title, name            |

## Local storage

Flowers stores all your data locally in your browser. Nothing is sent to any server.

- **Endpoints** — Your saved API endpoints with their name, URL, and optional remembered state.
- **Presets** — Custom filter and layout presets you create to quickly switch views.
- **Filters** — Your active status codes, HTTP methods, and search query.
- **Settings** — Polling interval, auto-scroll, notifications, and sound alerts preferences.
- **Pinned entries** — Entries you pinned per endpoint, so they stay visible at the top.

You can export and import all of this data via the transfer feature.