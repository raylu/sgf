use axum::routing::get;
use sgf_parse::{SgfNode, go::Prop};
use std::fs;

#[tokio::main(flavor = "current_thread")]
async fn main() {
	let app = axum::Router::new()
		.route("/", get(root))
		.nest_service("/sgf", tower_http::services::ServeDir::new("game_records"));
	let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
	axum::serve(listener, app).await.unwrap();
}

async fn root() -> &'static str {
	"Hello, World!"
}

fn info() {
	let path = "game_records/2024 KifuDepot Games/2024-08-02 張羽喬 vs Liu Yifang.sgf";
	let game = parse_sgf(path).unwrap();
	let black = match game[0].get_property("PB").unwrap() {
		Prop::PB(st) => st,
		_ => unreachable!(),
	};
	let white = match game[0].get_property("PW").unwrap() {
		Prop::PW(st) => st,
		_ => unreachable!(),
	};
	println!("black: {}, white: {}", black, white);
}

fn parse_sgf<P: AsRef<std::path::Path> + ?Sized>(path: &P) -> Result<Vec<SgfNode<Prop>>, Box<dyn std::error::Error>> {
	let content = fs::read_to_string(path)?;
	Ok(sgf_parse::go::parse(&content)?)
}
