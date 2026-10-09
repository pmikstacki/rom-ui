use std::path::Path;
#[tokio::main]
async fn main() {
    let result = async {
        let path = std::env::args_os()
            .nth(1)
            .ok_or("missing configuration file")?;
        let config = rom_ui_gallery_host::read_configuration(Path::new(&path))?;
        rom_ui_gallery_host::serve(config).await
    }
    .await;
    if result.is_err() {
        eprintln!("Gallery ROM host failed. Check the approved configuration and storage.");
        std::process::exit(1);
    }
}
