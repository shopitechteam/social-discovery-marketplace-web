self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  const title = payload.title || "Shopi";
  const options = {
    body: payload.body || "You have a new message",
    icon: payload.icon || "/assets/shopi-logo.png",
    badge: payload.badge || "/assets/shopi-logo.png",
    tag: payload.tag || "shopi-message",
    data: {
      ...(payload.data || {}),
      url: payload.url || payload.data?.url || "/",
    },
  };

  const broadcastToClients = clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((windowClients) =>
      Promise.all(
        windowClients.map((client) =>
          client.postMessage({
            type: "shopi:push",
            payload: {
              title,
              body: options.body,
              url: options.data?.url || "/",
              tag: options.tag,
            },
          }),
        ),
      ),
    );

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      broadcastToClients,
    ]),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    event.notification.data?.url ||
    event.notification.data?.conversationUrl ||
    "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }

      return undefined;
    }),
  );
});
