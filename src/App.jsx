import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { FiPlay, FiPause, FiRefreshCw } from "react-icons/fi";

const beepStart = typeof Audio !== "undefined" ? new Audio("/sounds/start.mp3") : null;
const beepWarn = typeof Audio !== "undefined" ? new Audio("/sounds/warn.mp3") : null;
const beepEnd = typeof Audio !== "undefined" ? new Audio("/sounds/end.mp3") : null;

const weeklyWorkouts = {
  "شنبه": [
    {
      title: "گرم‌کردن",
      steps: ["پیاده‌روی درجا - ۳ دقیقه", "چرخش شانه - ۱۰ بار", "کشش پا - ۳۰ ثانیه هر پا"]
    },
    {
      title: "تمرینات مقاومتی با کش",
      steps: ["اسکوات با کش - ۱۲ تکرار", "پرس سینه با کش - ۱۰ تکرار", "پشت بازو با کش - ۱۰ تکرار"]
    },
    {
      title: "کول‌دان",
      steps: ["تنفس عمیق - ۲ دقیقه", "کشش گردن - ۳۰ ثانیه هر طرف", "کشش ران - ۳۰ ثانیه"]
    }
  ],
};

export default function CrohnFitnessApp() {
  const [selectedDay, setSelectedDay] = useState("شنبه");
  const [workoutIndex, setWorkoutIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const workouts = weeklyWorkouts[selectedDay] || [];
  const workout = workouts[workoutIndex];

  useEffect(() => {
    setSecondsLeft(180);
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [workoutIndex, stepIndex]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev === 6 && beepWarn) beepWarn.play();
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            if (beepEnd) beepEnd.play();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const nextStep = () => {
    if (!workout) return;
    setIsRunning(false);
    if (stepIndex < workout.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else if (workoutIndex < workouts.length - 1) {
      setWorkoutIndex(workoutIndex + 1);
      setStepIndex(0);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-[#f7f7f7] min-h-screen flex flex-col items-center justify-center space-y-6">
      <h1 className="text-2xl font-bold text-center text-[#444]">💪 امروز چی تمرین کنم؟</h1>

      <Select
        value={selectedDay}
        onValueChange={(val) => {
          setSelectedDay(val);
          setWorkoutIndex(0);
          setStepIndex(0);
          setIsRunning(false);
          setSecondsLeft(180);
        }}
      >
        <SelectTrigger className="w-full bg-white">
          <span>{selectedDay}</span>
        </SelectTrigger>
        <SelectContent>
          {Object.keys(weeklyWorkouts).map((day) => (
            <SelectItem key={day} value={day}>
              {day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Progress value={((workoutIndex * 5 + stepIndex + 1) / 15) * 100} className="w-full" />

      {workout && (
        <Card className="w-full">
          <CardContent className="p-4 space-y-2">
            <h2 className="text-xl font-semibold text-[#333]">{workout.title}</h2>
            <p className="text-base text-gray-700">{workout.steps[stepIndex]}</p>
          </CardContent>
        </Card>
      )}

      <div
        className={`text-center font-mono text-5xl font-bold ${
          secondsLeft <= 10 ? "animate-pulse text-red-600" : "text-[#555]"
        } select-none`}
      >
        تایمر: {formatTime(secondsLeft)}
      </div>

      <div className="flex gap-4 w-full justify-center">
        {isRunning ? (
          <Button
            onClick={() => setIsRunning(false)}
            className="bg-red-600 hover:bg-red-700 flex-1 rounded-lg shadow-md flex items-center justify-center space-x-2"
          >
            <FiPause size={20} />
            <span>توقف</span>
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (secondsLeft > 0) {
                setIsRunning(true);
                if (beepStart) beepStart.play();
              }
            }}
            className="bg-green-600 hover:bg-green-700 flex-1 rounded-lg shadow-md flex items-center justify-center space-x-2"
          >
            <FiPlay size={20} />
            <span>استارت</span>
          </Button>
        )}
        <Button
          onClick={() => {
            setSecondsLeft(180);
            setIsRunning(false);
          }}
          className="bg-yellow-400 hover:bg-yellow-500 flex-1 rounded-lg shadow-md flex items-center justify-center space-x-2"
        >
          <FiRefreshCw size={20} />
          <span>ریست</span>
        </Button>
      </div>

      <Button onClick={nextStep} className="w-full bg-[#7fc7a1] text-white mt-6 rounded-lg shadow-lg">
        {workoutIndex === workouts.length - 1 && stepIndex === workout.steps.length - 1
          ? "تمرین تمام شد 🎉"
          : "مرحله بعد"}
      </Button>
    </div>
  );
}
