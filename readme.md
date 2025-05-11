## setup

```sh
# upload SGFs to CF R2 with minio client
$ pushd game_records && mc cp -r *Games r2/sgf && popd
# serve /sgf/ from CF R2
$ pushd cloudflare && bun run deploy && popd

# build kombilo database
$ sudo apt install libboost-dev libsqlite3-dev
$ pushd libkombilo && make && popd
$ uv run process.py

# run server
$ bun run build
$ uv run sgf.py
```
