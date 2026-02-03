
import React, { useCallback } from 'react';
import { Inputs, Platform, HistoryItem } from '../types';
import { PLATFORMS } from '../constants';
import Icon from './Icon';

interface InputPanelProps {
    inputs: Inputs;
    setInputs: React.Dispatch<React.SetStateAction<Inputs>>;
    onRunDiagnosis: () => void;
    onGenerateImages: () => void;
    isLoading: boolean;
    canGenerateImages: boolean;
    history: HistoryItem[];
    onLoadHistory: (item: HistoryItem) => void;
    onClearHistory: () => void;
}

const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [mimeType, base64] = result.split(',');
            resolve({ base64, mimeType: mimeType.replace('data:', '').replace(';base64', '') });
        };
        reader.onerror = error => reject(error);
    });
};

const InputPanel: React.FC<InputPanelProps> = ({ 
    inputs, 
    setInputs, 
    onRunDiagnosis, 
    onGenerateImages, 
    isLoading, 
    canGenerateImages,
    history,
    onLoadHistory,
    onClearHistory
}) => {
    const handleInputChange = useCallback(<K extends keyof Inputs>(
        key: K,
        value: Inputs[K]
    ) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    }, [setInputs]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const { base64, mimeType } = await fileToBase64(e.target.files[0]);
                handleInputChange('adScreenshot', { base64, mimeType });
            } catch (error) {
                console.error("Error converting file to base64", error);
                handleInputChange('adScreenshot', null);
            }
        }
    };

    return (
        <div className="w-full lg:w-[400px] bg-black border-r border-[#222] p-8 flex flex-col h-full overflow-y-auto">
            <header className="mb-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-white rounded-sm"></div>
                    <h1 className="text-xl font-bold tracking-tight">TURBO<span className="text-neutral-500 font-normal">ROI</span></h1>
                </div>
                <p className="text-sm text-neutral-500 font-medium">Performance Media Intel Console</p>
            </header>
            
            <div className="flex-grow space-y-8">
                <section>
                    <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-3 block">Strategy Context</label>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-xs text-neutral-400 mb-1 block">Primary Ad Platform</span>
                            <select
                                value={inputs.platform}
                                onChange={(e) => handleInputChange('platform', e.target.value as Platform)}
                                className="block w-full bg-[#111] border border-[#333] text-sm text-white rounded-none p-2 focus:ring-1 focus:ring-white transition-all outline-none"
                            >
                                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </label>

                        <label className="block">
                            <span className="text-xs text-neutral-400 mb-1 block">KPI Snapshot</span>
                            <textarea
                                value={inputs.performanceData}
                                onChange={(e) => handleInputChange('performanceData', e.target.value)}
                                rows={4}
                                placeholder="Paste CPA, ROAS, CTR, etc."
                                className="block w-full bg-[#111] border border-[#333] text-sm text-white rounded-none p-3 focus:ring-1 focus:ring-white transition-all outline-none font-mono placeholder:text-neutral-700"
                            />
                        </label>
                    </div>
                </section>

                <section>
                    <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-3 block">Creative & Assets</label>
                    <div className="space-y-4">
                         <label className="block">
                            <span className="text-xs text-neutral-400 mb-1 block">Current Ad Copy</span>
                            <textarea
                                value={inputs.adCopy}
                                onChange={(e) => handleInputChange('adCopy', e.target.value)}
                                rows={3}
                                placeholder="Paste headline and body..."
                                className="block w-full bg-[#111] border border-[#333] text-sm text-white rounded-none p-3 focus:ring-1 focus:ring-white transition-all outline-none placeholder:text-neutral-700"
                            />
                        </label>
                        
                        <div className="relative group cursor-pointer border border-dashed border-[#333] hover:border-neutral-500 transition-colors p-6 text-center">
                            <input id="file-upload" type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                            <Icon name="upload" className="mx-auto h-5 w-5 text-neutral-600 mb-2"/>
                            <span className="text-xs text-neutral-500">{inputs.adScreenshot ? 'Asset Attached' : 'Drop Ad Creative Screenshot'}</span>
                            {inputs.adScreenshot && <div className="mt-2 text-[10px] text-emerald-500 font-mono uppercase tracking-tighter">Verified</div>}
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs text-neutral-400">Monthly Spend</label>
                        <span className="text-xs font-mono">${inputs.adSpend.toLocaleString()}</span>
                    </div>
                    <input
                        type="range"
                        min="100"
                        max="100000"
                        step="100"
                        value={inputs.adSpend}
                        onChange={(e) => handleInputChange('adSpend', parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-[#222] rounded-none appearance-none cursor-pointer accent-white"
                    />
                </section>
                
                <div className="flex items-center justify-between bg-[#111] border border-[#222] p-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-tight">Deep Audit</p>
                        <p className="text-[10px] text-neutral-500">Gemini 2.5 Pro Reasoning</p>
                    </div>
                    <button
                        type="button"
                        className={`${inputs.deepAudit ? 'bg-white' : 'bg-neutral-800'} relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
                        onClick={() => handleInputChange('deepAudit', !inputs.deepAudit)}
                    >
                        <span className={`${inputs.deepAudit ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'} pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out`} />
                    </button>
                </div>

                {history.length > 0 && (
                    <section className="pt-4 border-t border-[#222]">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs uppercase tracking-widest text-neutral-600 font-bold">Recent Audits</label>
                            <button onClick={onClearHistory} className="text-[10px] text-neutral-700 hover:text-red-500 uppercase tracking-tighter transition-colors">Clear</button>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin">
                            {history.map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => onLoadHistory(item)}
                                    className="w-full text-left p-3 bg-[#111] border border-[#222] hover:border-neutral-500 transition-all group"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-tight">{item.inputs.platform}</span>
                                        <span className="text-[9px] text-neutral-600 font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[9px] text-neutral-500 truncate uppercase tracking-tighter group-hover:text-neutral-400">
                                        Spend: ${item.inputs.adSpend.toLocaleString()}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <div className="pt-10 space-y-4">
                 <button
                    onClick={onRunDiagnosis}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-4 text-xs font-bold uppercase tracking-[0.2em] bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 transition-all shadow-xl"
                >
                    {isLoading ? 'Processing Neural Audit...' : 'Execute ROI Diagnosis'}
                </button>
                 <button
                    onClick={onGenerateImages}
                    disabled={isLoading || !canGenerateImages}
                    className="w-full flex justify-center items-center py-4 text-xs font-bold uppercase tracking-[0.2em] border border-[#333] text-neutral-400 hover:text-white hover:border-white disabled:opacity-30 transition-all"
                >
                    Generate Visual Concepts
                </button>
            </div>
        </div>
    );
};

export default InputPanel;
