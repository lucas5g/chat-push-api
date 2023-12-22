self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('push', event => {
  const body = event.data?.text() ?? ''
  const { email, message } = JSON.parse(body)
  event.waitUntil(
    self.registration.showNotification(email, {
      body: `Bom dia ${new Date().getHours()}:${new Date().getMinutes()} ${message}`,
    })
  )
})