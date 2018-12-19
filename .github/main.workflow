workflow "NPM Publish" {
  on = "push"
  resolves = ["Publish Server"]
}

action "Install" {
  uses = "actions/npm@c555744"
  args = "install"
}

action "Test" {
  uses = "actions/npm@c555744"
  args = "test"
  needs = ["Install"]
}

action "Publish Server" {
  uses = "actions/npm@c555744"
  needs = ["Test"]
  args = "publish --access public"
  secrets = ["NPM_AUTH_TOKEN"]
}
