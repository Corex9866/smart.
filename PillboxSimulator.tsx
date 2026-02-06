
import React, { useState, useEffect } from 'react';
import { COMPARTMENTS } from '../constants';
import { Medication, AdherenceStatus, AdherenceLog } from '../types';
import { Bell, Battery, Wifi, CheckCircle2, AlertCircle, Clock, Pill, Zap } from 'lucide-react';

interface Props {
  medications: Medication[];
  onTakePill: (medId: string, compId: number) => void;
  battery: number;
  setBattery: React.Dispatch<React.SetStateAction<number>>;
}

const PillboxSimulator: React.FC<Props> = ({ medications, onTakePill, battery, setBattery }) => {
  const [activeAlert, setActiveAlert] = useState<{med: Medication, time: string} | null>(null);
  const [batteryAlertDismissed, setBatteryAlertDismissed] = useState(false);

  // Simple simulation of RTC-based alerting
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHHmm = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      const upcoming = medications.find(m => m.times.includes(currentHHmm));
      if (upcoming) {
        setActiveAlert({ med: upcoming, time: currentHHmm });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [medications]);

  // Reset dismissal if battery goes back up (e.g. simulated recharge)
  useEffect(() => {
    if (battery >= 20) {
      setBatteryAlertDismissed(false);
    }
  }, [battery]);

  const showBatteryAlert = battery < 20 && !batteryAlertDismissed;

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl max-w-md mx-auto relative overflow-hidden">
      {/* Hardware Interface Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400">VitalOS v2.4</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setBattery(prev => Math.max(0, prev - 10))}
            className="p-1 hover:bg-slate-800 rounded text-slate-500 transition-colors"
            title="Simulate Battery Drain"
          >
            <Zap className="w-3 h-3" />
          </button>
          <Wifi className="w-4 h-4 text-slate-400" />
          <div className="flex items-center gap-1">
            <span className={`text-xs font-mono ${battery < 20 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>{battery}%</span>
            <Battery className={`w-4 h-4 ${battery < 20 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
        </div>
      </div>

      {/* Main OLED Display Area */}
      <div className="bg-black border-4 border-slate-800 rounded-xl p-6 h-48 flex flex-col items-center justify-center text-center mb-8 shadow-inner relative">
        {showBatteryAlert ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2 animate-pulse" />
            <h3 className="text-lg font-bold text-rose-500 uppercase tracking-tighter">Battery Critical</h3>
            <p className="text-slate-400 text-xs mb-4">Please connect power source</p>
            <button 
              onClick={() => setBatteryAlertDismissed(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] px-4 py-1.5 rounded-full font-mono uppercase border border-slate-700 transition-colors"
            >
              [ Dismiss ]
            </button>
          </div>
        ) : activeAlert ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <Bell className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-bounce" />
            <h3 className="text-xl font-bold text-amber-400 uppercase tracking-tighter">Time for Medication</h3>
            <p className="text-slate-300 text-lg font-medium">{activeAlert.med.name}</p>
            <p className="text-slate-500 text-sm">Comp {activeAlert.med.compartment} • {activeAlert.time}</p>
          </div>
        ) : (
          <div>
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <div className="text-3xl font-mono tracking-widest">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">System Ready</p>
          </div>
        )}
      </div>

      {/* Physical Compartments Visualization */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {COMPARTMENTS.map((num) => {
          const med = medications.find(m => m.compartment === num);
          const isAlerting = activeAlert?.med.compartment === num;
          
          return (
            <button
              key={num}
              onClick={() => {
                if (med) {
                  onTakePill(med.id, num);
                  if (isAlerting) setActiveAlert(null);
                }
              }}
              disabled={!med}
              className={`
                aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all relative
                ${!med ? 'border-slate-800 opacity-20 cursor-not-allowed' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'}
                ${isAlerting ? 'ring-4 ring-amber-500 ring-offset-4 ring-offset-slate-900 border-amber-500 bg-amber-500/10' : ''}
              `}
            >
              {isAlerting && (
                <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-1 animate-ping">
                  <div className="w-4 h-4" />
                </div>
              )}
              <span className="text-[10px] text-slate-500 mb-1">C-{num}</span>
              <Pill className={`w-6 h-6 ${med ? 'text-blue-400' : 'text-slate-700'}`} />
            </button>
          );
        })}
        <div className="aspect-square flex flex-col items-center justify-center text-slate-600">
          <span className="text-[10px]">OK</span>
          <div 
            onClick={() => setBattery(100)}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-700"
            title="Reset Battery"
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="text-[10px] text-center text-slate-500 font-mono italic">
        "Simulating hardware lid sensors & multimodal alerts"
      </div>
    </div>
  );
};

export default PillboxSimulator;
