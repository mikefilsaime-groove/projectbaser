// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package scaleworkspace

import (
	"encoding/json"
	"net/http"
	"testing"
)

// fixtureJSON mirrors docs/workspaces/fixtures/workspace-context-v1.json in
// the central ScalePlus repository, bound to this application's slug.
const fixtureJSON = `{
  "version": 1,
  "actor": {
    "keycloakSubject": "11111111-1111-4111-8111-111111111111",
    "email": "member@example.com"
  },
  "workspace": {
    "id": "22222222-2222-4222-8222-222222222222",
    "displayName": "Acme Growth Team",
    "type": "guest"
  },
  "owner": {
    "keycloakSubject": "33333333-3333-4333-8333-333333333333",
    "displayName": "Workspace Owner",
    "email": "owner@example.com"
  },
  "membership": {
    "role": "member",
    "status": "active"
  },
  "application": {
    "slug": "projectbaser",
    "capability": "general-member"
  },
  "authorizationVersion": "0123456789abcdef01234567",
  "expiresAt": "2026-08-18T12:05:00.000Z"
}`

func fixtureContext(t *testing.T, mutate func(c *Context)) *Context {
	t.Helper()
	var c Context
	if err := json.Unmarshal([]byte(fixtureJSON), &c); err != nil {
		t.Fatalf("failed to decode fixture: %v", err)
	}
	if mutate != nil {
		mutate(&c)
	}
	return &c
}

func TestValidateContextAcceptsOnlyAppBoundActiveMember(t *testing.T) {
	if err := ValidateContext(fixtureContext(t, nil)); err != nil {
		t.Fatalf("expected the shared fixture bound to %q to validate, got: %v", AppSlug, err)
	}

	rejected := map[string]func(c *Context){
		"different application slug": func(c *Context) { c.Application.Slug = "mailbaser" },
		"unknown capability":         func(c *Context) { c.Application.Capability = "admin" },
		"wrong version":              func(c *Context) { c.Version = 2 },
		"non-guest workspace":        func(c *Context) { c.Workspace.Type = "personal" },
		"revoked membership":         func(c *Context) { c.Membership.Status = "revoked" },
		"owner role":                 func(c *Context) { c.Membership.Role = "owner" },
		"missing actor subject":      func(c *Context) { c.Actor.KeycloakSubject = "" },
		"missing owner subject":      func(c *Context) { c.Owner.KeycloakSubject = "" },
		"missing workspace id":       func(c *Context) { c.Workspace.ID = "" },
		"invalid expiry":             func(c *Context) { c.ExpiresAt = "not-a-date" },
	}
	for name, mutate := range rejected {
		if err := ValidateContext(fixtureContext(t, mutate)); err == nil {
			t.Errorf("expected context with %s to be rejected", name)
		}
	}

	if err := ValidateContext(nil); err == nil {
		t.Error("expected nil context to be rejected")
	}
}

func TestParseContextRejectsMalformedPayloads(t *testing.T) {
	if _, err := ParseContext("{"); err == nil {
		t.Error("expected malformed JSON to be rejected")
	}
	if _, err := ParseContext(`{"version":1}`); err == nil {
		t.Error("expected incomplete context to be rejected")
	}
	parsed, err := ParseContext(fixtureJSON)
	if err != nil {
		t.Fatalf("expected fixture JSON to parse, got: %v", err)
	}
	if parsed.Workspace.ID != "22222222-2222-4222-8222-222222222222" {
		t.Errorf("unexpected workspace id %q", parsed.Workspace.ID)
	}
}

func TestClassifyAllowsNormalMemberWork(t *testing.T) {
	allowed := []struct{ method, path string }{
		{http.MethodGet, "/api/v2/boards/board123"},
		{http.MethodPost, "/api/v2/boards"},
		{http.MethodPatch, "/api/v2/boards/board123/blocks/block456"},
		{http.MethodGet, "/api/v2/boards/board123/archive/export"},
		{http.MethodPost, "/api/v2/boards-and-blocks"},
		{http.MethodGet, "/api/v2/cards/card123"},
		{http.MethodPost, "/api/v2/content-blocks/b1/moveto/after/b2"},
		{http.MethodGet, "/api/v2/teams"},
		{http.MethodGet, "/api/v2/teams/team123"},
		{http.MethodGet, "/api/v2/teams/team123/boards"},
		{http.MethodGet, "/api/v2/teams/team123/templates"},
		{http.MethodPost, "/api/v2/teams/team123/categories"},
		{http.MethodGet, "/api/v2/teams/team123/users"},
		{http.MethodPost, "/api/v2/teams/team123/users"},
		{http.MethodPost, "/api/v2/teams/team123/board456/files"},
		{http.MethodGet, "/api/v2/files/teams/team123/board456/file.png"},
		{http.MethodPost, "/api/v2/subscriptions"},
		{http.MethodGet, "/api/v2/users/me"},
		{http.MethodGet, "/api/v2/users/me/memberships"},
		{http.MethodPost, "/api/v2/users"},
		{http.MethodPut, "/api/v2/users/user123/config"},
		{http.MethodPost, "/api/v2/logout"},
		{http.MethodGet, "/api/v2/clientConfig"},
		{http.MethodGet, "/api/v2/scale-workspace/display-context"},
		{http.MethodPost, "/api/v2/scale-workspace/leave"},
	}
	for _, tc := range allowed {
		if Classify(tc.method, tc.path) != DecisionAllow {
			t.Errorf("expected %s %s to be allowed for guest members", tc.method, tc.path)
		}
	}
}

func TestClassifyDeniesSensitiveOwnerOnlySurfaces(t *testing.T) {
	denied := []struct{ method, path string }{
		{http.MethodPost, "/api/v2/admin/users/alice/password"},
		{http.MethodPost, "/api/v2/register"},
		{http.MethodPost, "/api/v2/login"},
		{http.MethodPost, "/api/v2/users/user123/changepassword"},
		{http.MethodPost, "/api/v2/teams/team123/regenerate_signup_token"},
		{http.MethodGet, "/api/v2/boards/board123/sharing"},
		{http.MethodPost, "/api/v2/boards/board123/sharing"},
		{http.MethodGet, "/api/v2/teams/team123/archive/export"},
		{http.MethodPost, "/api/v2/teams/team123/archive/import"},
		{http.MethodGet, "/api/v2/statistics"},
		{http.MethodGet, "/api/v2/teams/team123/channels"},
	}
	for _, tc := range denied {
		if Classify(tc.method, tc.path) != DecisionDeny {
			t.Errorf("expected %s %s to be denied for guest members", tc.method, tc.path)
		}
	}
}

func TestClassifyFailsClosedForUnknownSurfaces(t *testing.T) {
	denied := []struct{ method, path string }{
		{http.MethodGet, "/api/v2/new-sensitive-feature"},
		{http.MethodPost, "/api/v2/billing/portal"},
		{http.MethodGet, "/api/v2/integrations/credentials"},
		{http.MethodDelete, "/api/v2/teams/team123"},
		{http.MethodPost, "/api/v2/teams"},
		{http.MethodGet, "/api/v2/users/user123/sessions"},
		{http.MethodGet, "/api/v2"},
		{http.MethodGet, "/other/path"},
		// Allowed paths with unlisted methods also fail closed.
		{http.MethodDelete, "/api/v2/users/user123"},
		{http.MethodPost, "/api/v2/teams/team123/templates"},
	}
	for _, tc := range denied {
		if Classify(tc.method, tc.path) != DecisionDeny {
			t.Errorf("expected unknown surface %s %s to be denied", tc.method, tc.path)
		}
	}
}

func TestEnabledDefaultsToOff(t *testing.T) {
	t.Setenv("SCALE_TEAM_WORKSPACES_ENABLED", "")
	if Enabled() {
		t.Fatal("adapter must be disabled by default")
	}
	t.Setenv("SCALE_TEAM_WORKSPACES_ENABLED", "1")
	if Enabled() {
		t.Fatal("only the literal string \"true\" may enable the adapter")
	}
	t.Setenv("SCALE_TEAM_WORKSPACES_ENABLED", "true")
	if !Enabled() {
		t.Fatal("expected adapter to be enabled when flag is true")
	}
}

func TestSanitizeReturnPath(t *testing.T) {
	cases := map[string]string{
		"/boards/abc":            "/boards/abc",
		"/":                      "/",
		"":                       "/",
		"//evil.example.com":     "/",
		"https://evil.example":   "/",
		"boards/abc":             "/",
		"/ok\r\nSet-Cookie: x=1": "/",
		"\\\\evil":               "/",
	}
	for input, want := range cases {
		if got := SanitizeReturnPath(input); got != want {
			t.Errorf("SanitizeReturnPath(%q) = %q, want %q", input, got, want)
		}
	}
}

func TestValidLaunchCode(t *testing.T) {
	if !ValidLaunchCode("abcDEF123-_.") {
		t.Error("expected plausible opaque code to be accepted")
	}
	if ValidLaunchCode("") {
		t.Error("expected empty code to be rejected")
	}
	if ValidLaunchCode(string(make([]byte, 300))) {
		t.Error("expected oversized code to be rejected")
	}
	if ValidLaunchCode("has space") {
		t.Error("expected whitespace to be rejected")
	}
	if ValidLaunchCode("newline\n") {
		t.Error("expected control characters to be rejected")
	}
}

func TestHubURLDefaultsAndTrimming(t *testing.T) {
	t.Setenv("SCALE_WORKSPACE_HUB_URL", "")
	if HubURL() != "https://app.scaleplus.gg" {
		t.Fatalf("unexpected default hub URL %q", HubURL())
	}
	t.Setenv("SCALE_WORKSPACE_HUB_URL", "https://hub.example.com/")
	if HubURL() != "https://hub.example.com" {
		t.Fatalf("expected trailing slash to be trimmed, got %q", HubURL())
	}
	if SwitchURL() != "https://hub.example.com/team" {
		t.Fatalf("unexpected switch URL %q", SwitchURL())
	}
}
