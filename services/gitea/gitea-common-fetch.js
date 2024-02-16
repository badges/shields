async function fetchIssue(
  serviceInstance,
  { user, repo, baseUrl, options, httpErrors },
) {
  return serviceInstance._request(
    serviceInstance.authHelper.withBearerAuthHeader({
      url: `${baseUrl}/api/v1/repos/${user}/${repo}/issues`,
      options,
      httpErrors,
    }),
  )
}

export { fetchIssue }
