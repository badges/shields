async function fetch(serviceInstance, params) {
  return serviceInstance._requestJson(
    await serviceInstance.authHelper.withJwtAuth(
      params,
      'https://hub.docker.com/v2/users/login/',
    ),
  )
}

export { fetch }
