import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { getFFmpeg } from '../services/ffmpeg-setup';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type Step = 'RECORD' | 'EDIT' | 'POST';

const CreateReelPage = () => {
  const [step, setStep] = useState<Step>('RECORD');
  const [recordedClips, setRecordedClips] = useState<Blob[]>([]);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading Video Editor...');

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpegInstance = await getFFmpeg();
        setFfmpeg(ffmpegInstance);
      } catch (error) {
        console.error("Failed to load FFmpeg", error);
        toast.error("Video editor failed to load. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };
    loadFFmpeg();
  }, []);

  const handleRecordingComplete = (clips: Blob[]) => {
    if (clips.length === 0) {
      toast.error("Please record at least one clip.");
      return;
    }
    setRecordedClips(clips);
    setStep('EDIT');
  };

  const handleEditComplete = (videoUrl: string) => {
    setProcessedVideoUrl(videoUrl);
    setStep('POST');
  };

  const renderStep = () => {
    switch (step) {
      case 'RECORD':
        return <RecordScreen onRecordingComplete={handleRecordingComplete} clips={recordedClips} setClips={setRecordedClips} />;
      case 'EDIT':
        return <EditScreen clips={recordedClips} onEditComplete={handleEditComplete} ffmpeg={ffmpeg} setIsLoading={setIsLoading} setLoadingMessage={setLoadingMessage} />;
      case 'POST':
        return <PostScreen videoUrl={processedVideoUrl!} ffmpeg={ffmpeg} setIsLoading={setIsLoading} setLoadingMessage={setLoadingMessage} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen bg-black text-white relative">
      {(isLoading || !ffmpeg) && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
          <p className="text-lg">{loadingMessage}</p>
        </div>
      )}
      {ffmpeg && renderStep()}
    </div>
  );
};

// --- RecordScreen Component ---
const RecordScreen = ({ onRecordingComplete, clips, setClips }: { onRecordingComplete: (clips: Blob[]) => void, clips: Blob[], setClips: Dispatch<SetStateAction<Blob[]>> }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast.error('Could not access camera. Please check permissions.');
      }
    }
    setupCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleStartRecording = () => {
    if (stream) {
      setIsRecording(true);
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const recordedChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.push(event.data);
      };

      recorder.onstop = () => {
        const newClip = new Blob(recordedChunks, { type: 'video/webm' });
        setClips(prev => [...prev, newClip]);
      };

      recorder.start();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-black text-white p-4">
      <h2 className="text-2xl font-bold mb-4">Record Reel</h2>
      <div className="w-full max-w-md aspect-[9/16] bg-gray-800 rounded-lg mb-4 overflow-hidden">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
      </div>
      <Button 
        onClick={isRecording ? handleStopRecording : handleStartRecording} 
        className={`mb-4 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-white' : 'bg-red-600 hover:bg-red-700'}`}>
        <div className={`w-8 h-8 rounded-md transition-all duration-300 ${isRecording ? 'bg-red-600' : 'bg-white'}`} />
      </Button>
      <p className="mb-4">Clips recorded: {clips.length}</p>
      <Button onClick={() => onRecordingComplete(clips)} disabled={clips.length === 0}>
        Next
      </Button>
    </div>
  );
};

// --- EditScreen Component ---
const EditScreen = ({ clips, onEditComplete, ffmpeg, setIsLoading, setLoadingMessage }: { clips: Blob[], onEditComplete: (url: string) => void, ffmpeg: FFmpeg | null, setIsLoading: (l:boolean)=>void, setLoadingMessage: (m:string)=>void }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const mergeClips = async () => {
      if (!ffmpeg || clips.length === 0) return;
      setIsLoading(true);
      setLoadingMessage('Merging clips...');
      try {
        for (let i = 0; i < clips.length; i++) {
          await ffmpeg.writeFile(`clip${i}.webm`, await fetchFile(clips[i]));
        }

        const fileList = clips.map((_, i) => `file 'clip${i}.webm'`).join('\n');
        await ffmpeg.writeFile('input.txt', fileList);

        await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'input.txt', '-c', 'copy', 'output.mp4']);

        const data = await ffmpeg.readFile('output.mp4');
        const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: 'video/mp4' }));
        setVideoUrl(url);
      } catch (error) {
        console.error("Error merging clips:", error);
        toast.error("Failed to process video.");
      } finally {
        setIsLoading(false);
      }
    };
    mergeClips();
  }, [ffmpeg, clips, setIsLoading, setLoadingMessage]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black relative">
      {videoUrl && <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />}
      <div className="absolute bottom-8 flex items-center justify-around w-full">
        <Button onClick={() => onEditComplete(videoUrl!)} disabled={!videoUrl}>
          Next
        </Button>
      </div>
    </div>
  );
};

// --- PostScreen Component ---
const PostScreen = ({ videoUrl, ffmpeg, setIsLoading, setLoadingMessage }: { videoUrl: string, ffmpeg: FFmpeg | null, setIsLoading: (l:boolean)=>void, setLoadingMessage: (m:string)=>void }) => {
  const [caption, setCaption] = useState('');
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();

  const handlePost = async () => {
    if (!user || !videoUrl) return;
    setIsLoading(true);
    setLoadingMessage('Posting...');

    try {
      const videoFile = await fetchFile(videoUrl)
      const fileName = `reels/${user.id}/${Date.now()}.mp4`;
      const { error: uploadError } = await supabase.storage
        .from('reels')
        .upload(fileName, videoFile, { 
          contentType: 'video/mp4',
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('reels').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('reels').insert({
        user_id: user.id,
        video_url: urlData.publicUrl,
        caption: caption,
      });

      if (dbError) throw dbError;

      toast.success('Reel posted successfully!');
      navigate('/reels');
    } catch (error) {
      console.error('Error posting reel:', error);
      toast.error('Failed to post reel.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <video src={videoUrl} controls loop className="w-full max-w-md aspect-[9/16] rounded-lg mb-4" />
      <textarea 
        value={caption} 
        onChange={(e) => setCaption(e.target.value)} 
        placeholder="Write a caption..." 
        className="w-full max-w-md p-2 rounded-lg bg-gray-800 text-white mb-4"
      />
      <Button onClick={handlePost}>
        Post
      </Button>
    </div>
  );
};

export default CreateReelPage;
