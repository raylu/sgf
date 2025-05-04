use axum::routing::get;
use sgf_parse::{SgfNode, go::Prop};
use std::fs;

#[tokio::main(flavor = "current_thread")]
async fn main() {
	let app = axum::Router::new()
		.fallback_service(tower_http::services::ServeFile::new("frontend/index.html"))
		.route("/search", get(search))
		.nest_service("/sgf", tower_http::services::ServeDir::new("game_records"))
		.nest_service("/static", tower_http::services::ServeDir::new("static"));
	let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
	axum::serve(listener, app).await.unwrap();
}

async fn search() -> String {
	let sgf_paths = walkdir::WalkDir::new("game_records")
		.into_iter()
		.filter_map(|e| e.ok())
		.filter(|e| e.file_type().is_file())
		.filter_map(|e| e.path().to_str().map(|s| s.to_string()))
		.filter(|s| s.ends_with(".sgf"));
	for path in sgf_paths {
		match parse_sgf(&path) {
			Ok(game) => {
				let mut black = "";
				let mut white = "";
				for prop in game[0].properties() {
					match prop {
						Prop::PB(name) => black = &name.text,
						Prop::PW(name) => white = &name.text,
						_ => {},
					}
				}
				println!("black: {}, white: {}", black, white);
			},
			Err(e) => println!("Error parsing {}: {}", path, e),
		}
	}
	"done".to_string()
}

fn parse_sgf<P: AsRef<std::path::Path> + ?Sized>(path: &P) -> Result<Vec<SgfNode<Prop>>, Box<dyn std::error::Error>> {
	let content = fs::read_to_string(path)?;
	Ok(sgf_parse::go::parse(&content)?)
}
