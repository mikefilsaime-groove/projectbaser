package config

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
)

func TestReadConfigFileAppliesFileStorageEnvironment(t *testing.T) {
	viper.Reset()
	t.Cleanup(viper.Reset)

	configPath := filepath.Join(t.TempDir(), "config.json")
	require.NoError(t, os.WriteFile(configPath, []byte(`{"filesdriver":"local","filespath":"./files"}`), 0o600))

	t.Setenv("FOCALBOARD_FILES_DRIVER", "amazons3")
	t.Setenv("FOCALBOARD_FILES_S3_ACCESS_KEY_ID", "access-key")
	t.Setenv("FOCALBOARD_FILES_S3_SECRET_ACCESS_KEY", "secret-key")
	t.Setenv("FOCALBOARD_FILES_S3_BUCKET", "projectbaser")
	t.Setenv("FOCALBOARD_FILES_S3_PATH_PREFIX", "uploads")
	t.Setenv("FOCALBOARD_FILES_S3_REGION", "nyc3")
	t.Setenv("FOCALBOARD_FILES_S3_ENDPOINT", "nyc3.digitaloceanspaces.com")
	t.Setenv("FOCALBOARD_FILES_S3_SSL", "true")
	t.Setenv("FOCALBOARD_FILES_S3_SIGN_V2", "false")
	t.Setenv("FOCALBOARD_FILES_S3_SSE", "false")
	t.Setenv("FOCALBOARD_FILES_S3_TRACE", "false")
	t.Setenv("FOCALBOARD_FILES_S3_TIMEOUT", "30000")

	config, err := ReadConfigFile(configPath)
	require.NoError(t, err)
	require.Equal(t, "amazons3", config.FilesDriver)
	require.Equal(t, "access-key", config.FilesS3Config.AccessKeyID)
	require.Equal(t, "secret-key", config.FilesS3Config.SecretAccessKey)
	require.Equal(t, "projectbaser", config.FilesS3Config.Bucket)
	require.Equal(t, "uploads", config.FilesS3Config.PathPrefix)
	require.Equal(t, "nyc3", config.FilesS3Config.Region)
	require.Equal(t, "nyc3.digitaloceanspaces.com", config.FilesS3Config.Endpoint)
	require.True(t, config.FilesS3Config.SSL)
	require.False(t, config.FilesS3Config.SignV2)
	require.Equal(t, int64(30000), config.FilesS3Config.Timeout)
}

func TestReadConfigFileRejectsInvalidFileStorageEnvironment(t *testing.T) {
	viper.Reset()
	t.Cleanup(viper.Reset)

	configPath := filepath.Join(t.TempDir(), "config.json")
	require.NoError(t, os.WriteFile(configPath, []byte(`{}`), 0o600))
	t.Setenv("FOCALBOARD_FILES_S3_SSL", "sometimes")

	_, err := ReadConfigFile(configPath)
	require.ErrorContains(t, err, "FOCALBOARD_FILES_S3_SSL")
}

func TestRemoveSecurityDataRedactsCredentials(t *testing.T) {
	config := Configuration{
		DBConfigString: "database-secret",
		Secret:         "session-secret",
		FilesS3Config: AmazonS3Config{
			AccessKeyID:     "access-key",
			SecretAccessKey: "secret-key",
		},
	}

	clean := removeSecurityData(config)
	require.Equal(t, "[redacted]", clean.DBConfigString)
	require.Equal(t, "[redacted]", clean.Secret)
	require.Equal(t, "[redacted]", clean.FilesS3Config.AccessKeyID)
	require.Equal(t, "[redacted]", clean.FilesS3Config.SecretAccessKey)
	require.Equal(t, "database-secret", config.DBConfigString)
}
