import React, { useState, useEffect, useCallback } from "react";

import MoviesList from "./components/MoviesList";
import AddMovie from "./components/AddMovie";
import "./App.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // 오류 초기화

  // fetchMoviesHandler (HTTP request 하는 핸들러) : 컴포넌트 상태변경 -> 리렌더링 시 실행되는데,
  // useCallback 훅을 사용함으로써, 리렌더링 되는 것을 막아줌.
  // useCallback : 함수를 메모이제이션 => useEffect 가 필요할 때만 실행되게 도와주는 훅
  const fetchMoviesHandler = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        // fetch : 기본적으로 GET
        "https://udemy-react-http-2f0b2-default-rtdb.firebaseio.com/movies.json",
      );

      // 밑에 코드 파싱하기 전에 응답이 ok 인지 확인 처리 필요
      if (!response.ok) {
        throw new Error("Something went wrong!");
      }

      // response의 body부분 파싱 - JSON 데이터 실패하면 안보냄
      const data = await response.json();

      // 기존에는 아래와 같이 작성 ==> 데이터가 배열
      // const transformed = data.results.map((movieData)=>{
      // return {id: movieData.id, title: movieData.title}
      // })

      // 데이터가 객체로 변경됨
      const loadedMovies = [];

      for (const key in data) {
        loadedMovies.push({
          id: key,
          title: data[key].title,
          openingText: data[key].openingText,
          releaseDate: data[key].releaseDate,
        });
      }

      setMovies(loadedMovies);
    } catch (error) {
      setError(error.message);
    }
    setIsLoading(false); // 이미 오류 발생했을 경우, 로딩할 필요 X
  }, []);

  // 특정 컴포넌트 실행될 때마다 코드 실행 = useEffect 훅
  // => fetchMoviesHandler(;HTTP 요청을 보내는 함수) 컴포넌트 실행될 때마다 해당 함수 실행.
  useEffect(() => {
    fetchMoviesHandler();
  }, [fetchMoviesHandler]);
  // fetchMoviesHandler 에서 useCallback 사용했기 때문에, 무한 loop 생성 안됨.
  // useEffect + useCallback => 컴포넌트가 로드될 때, 즉각적으로 HTTP 요청 전송

  // 비동기 작업, promise 객체 돌려받을 것임 => async, await 사용
  async function addMovieHandler(movie) {
    const response = await fetch(
      // fetch : 가져옴(GET=default) + 전송(POST)
      "https://udemy-react-http-2f0b2-default-rtdb.firebaseio.com/movies.json",
      {
        method: "POST", // POST : firebase 에서 리소스 생성 (BE영역임)
        body: JSON.stringify(movie), // JSON.stringify() : JSON 형태로 변환해줘야 함. ---> JSON (데이터 형태 : FE - BE 데이터 교환 시, JSON 형태 사용)
        headers: {
          "Content-Type": "application/json", // 안써도 되지만, 어떤 컨텐츠가 헤더로 전달되었는지 알 수 있기 때문에 작성
        },
      },
    );
    const data = await response.json(); // firebase가 전달하는 데이터 역시 JSON 형식

    // 오류 처리하고 싶으면, fetchMoviesHandler 와 같이 try-catch 사용할 것
    console.log(data);
  }

  let content = <p>Found no movies.</p>;

  if (movies.length > 0) {
    content = <MoviesList movies={movies} />;
  }

  if (error) {
    content = <p>{error}</p>;
  }

  if (isLoading) {
    content = <p>Loading...</p>;
  }

  const anotherFetchHandler = async () => {
    const response = await fetch(
      "https://api.themoviedb.org/3/movie/550?api_key=be03c15aff80b580d770e82af590a92a",
    );

    const fetchData = await response.json();

    const loadedData = [];

    for (const key in fetchData) {
      loadedData.push({
        id: key,
        score: fetchData[key],
      });
    }

    console.log(loadedData);
    console.log(fetchData);
  };

  useEffect(() => {
    anotherFetchHandler();
  }, []);

  return (
    <React.Fragment>
      <section>
        <AddMovie onAddMovie={addMovieHandler} />
      </section>
      <section>
        <button onClick={fetchMoviesHandler}>Fetch Movies</button>
      </section>
      <section>{content}</section>
      <button
        style={{ display: "flex", margin: "auto" }}
        onClick={anotherFetchHandler}
      >
        MOVIE
      </button>
    </React.Fragment>
  );
}

export default App;
