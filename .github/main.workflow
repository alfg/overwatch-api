workflow "NPM Publish Server & Client" {
  resolves = [
    "Publish Server",
    "Publish API",
    "Install API",
  ]
  on = "release"
}

action "Install Server" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "install"
}

action "Test Server" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "test"
  needs = [
    "Install Server",
  ]
}

action "Publish Server" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
  needs = ["Test Server"]
}

action "Test API" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = [
    "Install API",
  ]
  args = "test --prefix api"
}

action "Publish API" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["Test API"]
  args = "publish api --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}

action "Install API" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "install"
}
