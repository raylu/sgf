CXXFLAGS=-O2 -fPIC -std=c++11 -pipe -march=native -Wno-deprecated

_libkombilo.so: libkombilo_wrap.o abstractboard.o algos.o pattern.o search.o sgfparser.o
	clang++ ${CXXFLAGS} -shared $^ -lsqlite3 -o $@

libkombilo_wrap.o: libkombilo_wrap.cxx
	clang++ ${CXXFLAGS} -c $< -I /usr/include/python3.13

.PHONY: clean
clean:
	rm -f *.o _libkombilo.so
