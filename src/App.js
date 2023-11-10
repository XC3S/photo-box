import './App.css';

import React, { useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

import { Amplify, Storage } from 'aws-amplify';

import awsExports from './aws-exports';
Amplify.configure(awsExports);

function App() {
  const webcamRef = React.useRef(null);
  const [imgSrc, setImgSrc] = React.useState(null);

  const images = React.useRef([]);
  const [timerState, setTimerState] = React.useState(false);
  const [transition, setTransition] = React.useState(false);


  const [heroImage, setHeroImage] = React.useState(null);

  useEffect(() => {
    load();

    setInterval(() => {
      if(images.current.length) {
        const tmp = images.current.sort(() => Math.random() - 0.5)
        setHeroImage(tmp[0]);
      }
      else {
        load();
      }
    }, 10000);


    setInterval(() => {
      load();
    }, 60000);
    
  }, []);



  const capture = React.useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);

    setTimerState(3);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setTimerState(2);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setTimerState(1);
    await new Promise(resolve => setTimeout(resolve, 1000));

    fetch(imageSrc)
      .then(res => res.blob() )
      .then( async (blob) => {
          const file = new File( [blob], "tmp.png")
          const key = Date.now() + ".png"
          await Storage.put(key, file)

          setTimerState(false);
      })
  }, [webcamRef, setImgSrc]);

  function load() {
    Storage.list('')
      .then(result => {
        const URL_PREFIX = "https://photobox142018-dev.s3.eu-central-1.amazonaws.com/public/";
        const tmp = result.results.map( img => URL_PREFIX + img.key);

        images.current = tmp;
      })
      .catch(err => console.log(err));
  }

  return (
    <div className="App">
      <BrowserRouter>
        <NavLink to="tv">TV</NavLink>&nbsp;&nbsp;&nbsp;
        <NavLink to="photobox">Photobox</NavLink>

        <Routes>
          <Route path="/" element={<>
            <h1>Home</h1>
          </>} />

          <Route path="tv" element={<>
            <h1>TV</h1>

            <div className='container'>
              <img className='hero' src={heroImage} />
            </div>
          </>} />

          <Route path="photobox" element={<>
            <h1>photobox</h1>
            <div className='camera'>
              <Webcam
                  className='webcam'
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
              />

              { timerState 
                ? <div className='timer'>{ timerState }</div> 
                : <button className='capture' onClick={() => capture()}></button>
              }
            </div>
          
            
            
          </>} />

          <Route path="*" element={<>
            <h1>Not Found</h1>
          </>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
