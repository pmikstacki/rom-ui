use super::{read_configuration, secret};
use std::{fs, os::unix::fs::PermissionsExt};

#[test]
fn credential_requires_private_regular_nonempty_bounded_file() {
    let directory = tempfile::tempdir().unwrap();
    let path = directory.path().join("credential");
    fs::write(&path, "fixture-secret\r\n").unwrap();
    fs::set_permissions(&path, fs::Permissions::from_mode(0o600)).unwrap();
    assert_eq!(secret(&path).unwrap(), "fixture-secret");
    fs::set_permissions(&path, fs::Permissions::from_mode(0o640)).unwrap();
    assert_eq!(
        secret(&path).unwrap_err(),
        "credential file must be private"
    );
    fs::set_permissions(&path, fs::Permissions::from_mode(0o600)).unwrap();
    fs::write(&path, "\r\n").unwrap();
    assert_eq!(secret(&path).unwrap_err(), "credential file is empty");
    fs::write(&path, vec![b'x'; 16_385]).unwrap();
    assert_eq!(
        secret(&path).unwrap_err(),
        "configuration file exceeds its limit"
    );
    assert!(secret(directory.path()).is_err());
}

#[test]
fn configuration_rejects_unknown_and_oversized_inputs() {
    let directory = tempfile::tempdir().unwrap();
    let path = directory.path().join("configuration");
    fs::write(&path, "{\"unexpected\":true}").unwrap();
    assert!(read_configuration(&path).is_err());
    fs::write(&path, vec![b' '; 65_537]).unwrap();
    assert!(read_configuration(&path).is_err());
}
