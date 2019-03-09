workflow "NPM Publish Server & Client" {
  resolves = [
    "Publish Server",
    "Publish API",
  ]
  on = "release"
}

action "Install" {
  uses = "actions/npm@c555744"
  args = "install"
}

action "Test Server" {
  uses = "actions/npm@c555744"
  args = "test"
  needs = ["Install"]
}

action "Publish Server" {
  uses = "actions/npm@c555744"
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
  needs = ["Test Server"]
}

action "Test API" {
  uses = "actions/npm@c555744"
  needs = ["Install"]
  args = "test --prefix api"
}

action "Publish API" {
  uses = "actions/npm@c555744"
  needs = ["Test API"]
  args = "publish api --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}
