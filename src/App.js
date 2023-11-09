import './App.css';

import React from 'react';
import Webcam from 'react-webcam';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import { Amplify, Storage } from 'aws-amplify';

import awsExports from './aws-exports';
Amplify.configure(awsExports);

function App() {
  const webcamRef = React.useRef(null);
  const [imgSrc, setImgSrc] = React.useState(null);

  const [images, setImages] = React.useState([]);

  const capture = React.useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);

    console.log();

    fetch(imageSrc)
      .then(res => res.blob() )
      .then( async (blob) => {
          const file = new File( [blob], "tmp.png")
          const key = Date.now() + ".png"
          const result = await Storage.put(key, file, {
            contentType: 'image/png',
            level: 'public',
            ACL: 'public-read'
          })          
      })  
  }, [webcamRef, setImgSrc]);

  function load() {
    Storage.list('')
      .then(result => {
        console.log(result);

        const URL_PREFIX = "https://photobox142018-dev.s3.eu-central-1.amazonaws.com/public/";

        const tmp = result.results.map( img => URL_PREFIX + img.key);
      
        setImages(tmp);
      })
      .catch(err => console.log(err));
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Link to="/">Home</Link>
        <Link to="tv">TV</Link>
        <Link to="photobox">Photobox</Link>

        <Routes>
          <Route path="/" element={<>
            <h1>Home</h1>
          </>} />

          <Route path="tv" element={<>
            <h1>TV</h1>

            {images.map( img => <img src={img} /> )}

            <button onClick={() => load()}>load</button>
          </>} />

          <Route path="photobox" element={<>
            <h1>photobox</h1>
            <Webcam
                className='webcam'
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
            />

            <button className='capture' onClick={() => capture()}></button>
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
