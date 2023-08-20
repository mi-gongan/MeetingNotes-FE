import axios from "axios";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [text, setText] = useState<string>("");

  const startRecording = async () => {
    console.log("start");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        setRecordedChunks((prevChunks: Blob[]) => [...prevChunks, event.data]);
      }
    };

    recorder.start(5000); // 5초마다 청크 저장

    setMediaRecorder(recorder);
  };
  console.log("recorded", recordedChunks);
  const stopRecording = () => {
    console.log("stop");
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  };

  const saveRecording = () => {
    console.log("save");
    if (recordedChunks.length === 0) {
      return;
    }

    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "recorded-video.webm";
    a.click();

    // 초기화
    setRecordedChunks([]);
  };

  const sendRecording = async () => {
    console.log("send");
    console.log("recordedChunks", recordedChunks);
    const blob = new Blob(recordedChunks, { type: "video/webm" });

    const formData = new FormData();
    formData.append("video", blob, "audio" + index.toString()); // 서버에서 받을 때 사용할 파일 이름 지정
    console.log("formData video", formData.get("video"));
    try {
      const response = (
        await axios.post("http://localhost:4000/api/upload", formData)
      ).data; // 서버의 업로드 API 주소로 요청 보내기
      console.log("response", response);
      if (response.summary_text) {
        setText(response.summary_text);
      }
    } catch (error) {
      console.error("Error uploading recording:", error);
    }

    setIndex(index + 1);
  };

  useEffect(() => {
    if (videoRef.current) {
      (videoRef.current as any).src =
        recordedChunks.length > 0 ? URL.createObjectURL(recordedChunks[0]) : "";
    }
  }, [recordedChunks]);

  useEffect(() => {
    if (recordedChunks.length % 4 == 0 && recordedChunks.length != 0) {
      sendRecording();
    }
  }, [recordedChunks]);

  return (
    <div>
      <video ref={videoRef} controls />
      <button onClick={startRecording}>녹화 시작</button>
      <button onClick={stopRecording}>녹화 중지</button>
      <button onClick={saveRecording}>녹화 저장</button>
      <button onClick={sendRecording}>녹화 업로드</button>
      <div
        style={{
          fontSize: 20,
          width: 500,
          height: 500,
          border: "1px solid black",
          margin: 10,
          padding: 10,
          backgroundColor: "white",
          color: "black",
        }}
      >
        {text}
      </div>
    </div>
  );
}
