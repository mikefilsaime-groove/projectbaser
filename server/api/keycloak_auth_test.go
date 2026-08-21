package api

import "testing"

func TestHasRequiredRole(t *testing.T) {
	tests := []struct {
		name   string
		claims KeycloakTokenClaims
		want   bool
	}{
		{
			name: "accepts ProjectBaser client role",
			claims: KeycloakTokenClaims{ResourceAccess: map[string]interface{}{
				"app-projectbaser": map[string]interface{}{
					"roles": []interface{}{requiredKeycloakRole},
				},
			}},
			want: true,
		},
		{
			name: "accepts ProjectBaser realm role",
			claims: KeycloakTokenClaims{RealmAccess: map[string]interface{}{
				"roles": []interface{}{requiredKeycloakRole},
			}},
			want: true,
		},
		{
			name: "rejects role copied from another application",
			claims: KeycloakTokenClaims{RealmAccess: map[string]interface{}{
				"roles": []interface{}{"app_pipeleads"},
			}},
			want: false,
		},
		{
			name:   "rejects missing role",
			claims: KeycloakTokenClaims{},
			want:   false,
		},
	}

	testAPI := &API{}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := testAPI.hasRequiredRole(&test.claims, requiredKeycloakRole); got != test.want {
				t.Fatalf("hasRequiredRole() = %v, want %v", got, test.want)
			}
		})
	}
}
