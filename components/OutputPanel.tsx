
import React from 'react';
import { DiagnosisOutput, HeatmapItem, WorkspaceTask, CreativePack } from '../types';
import { WORKSPACE_TASKS, DIAGNOSIS_DEPENDENT_TASKS, PRICING_PLANS } from '../constants';
import Icon from './Icon';

interface OutputPanelProps {
    output: DiagnosisOutput | null;
    images: string[];
    workspace: { task: WorkspaceTask, input: string, output: string };
    setWorkspace: React.Dispatch<React.SetStateAction<{ task: WorkspaceTask, input: string, output: string }>>;
    onWorkspaceSubmit: () => void;
    isLoading: boolean;
    isGeneratingImages: boolean;
    error: string | null;
    sandbox: CreativePack | null;
    sandboxLoading: { hooks: boolean; copy: number; image: number };
    onGenerateMoreHooks: () => void;
    onRewriteCopy: (index: number) => void;
    onRegenerateImage: (index: number) => void;
    onPromptChange: (index: number, value: string) => void;
    onHooksChange: (value: string) => void;
    onCopyChange: (index: number, value: string) => void;
}

const Card: React.FC<{ title: string; subtitle?: string; icon: string; children: React.ReactNode; fullWidth?: boolean }> = ({ title, subtitle, icon, children, fullWidth }) => (
    <div className={`bg-black border border-[#222] p-8 flex flex-col ${fullWidth ? 'col-span-full' : ''} hover:border-neutral-700 transition-colors`}>
        <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 flex items-center justify-center bg-[#111] border border-[#222]">
                <Icon name={icon} className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
                <h2 className="text-xs uppercase tracking-widest font-bold text-white">{title}</h2>
                {subtitle && <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">{subtitle}</p>}
            </div>
        </div>
        <div className="text-neutral-400 leading-relaxed font-sans">{children}</div>
    </div>
);

const SeverityBadge: React.FC<{ severity: HeatmapItem['severity'] }> = ({ severity }) => {
    const colors = {
        High: 'text-red-500',
        Medium: 'text-amber-500',
        Low: 'text-emerald-500',
    };
    return <span className={`text-[10px] font-mono font-bold uppercase ${colors[severity]}`}>[{severity}]</span>;
};

const OutputPanel: React.FC<OutputPanelProps> = ({ output, images, workspace, setWorkspace, onWorkspaceSubmit, isLoading, isGeneratingImages, error, sandbox, sandboxLoading, onGenerateMoreHooks, onRewriteCopy, onRegenerateImage, onPromptChange, onHooksChange, onCopyChange }) => {

    const renderMarkdown = (text: string) => {
        return text.split('\n').map((line, index) => {
            if (line.startsWith('* ')) {
                return <li key={index} className="ml-4 list-none text-sm mb-2 text-neutral-400"><span className="text-neutral-600 mr-2">—</span>{line.substring(2)}</li>;
            }
             if (/^#+\s/.test(line)) {
                const level = line.match(/^#+/)?.[0].length || 1;
                const content = line.replace(/^#+\s/, '');
                return <h3 key={index} className="text-white text-sm font-bold uppercase tracking-widest mt-6 mb-3">{content}</h3>;
            }
            return <p key={index} className="text-sm text-neutral-400 mb-2 leading-relaxed">{line}</p>;
        });
    };
    
    const isDiagnosisTask = (task: WorkspaceTask) => DIAGNOSIS_DEPENDENT_TASKS.includes(task);

    return (
        <div className="flex-grow bg-[#050505] p-10 h-full overflow-y-auto">
            {isLoading && !output && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-[2px] bg-neutral-800 relative overflow-hidden mb-6">
                        <div className="absolute inset-0 bg-white animate-[shimmer_1.5s_infinite]"></div>
                    </div>
                    <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-neutral-500">Neural Diagnosis in Progress</h2>
                    <p className="text-[10px] text-neutral-700 mt-2 font-mono">Running specialized LLM logic for performance media...</p>
                    <style>{`
                        @keyframes shimmer {
                            0% { transform: translateX(-100%); }
                            100% { transform: translateX(100%); }
                        }
                    `}</style>
                </div>
            )}

            {error && (
                <div className="max-w-3xl mx-auto border border-red-900 bg-red-950/20 p-8">
                    <h3 className="text-xs font-bold uppercase text-red-500 tracking-widest mb-2">Audit Exception</h3>
                    <p className="text-sm font-mono text-red-200">{error}</p>
                </div>
            )}

            {!isLoading && !output && !error && (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
                    <Icon name="sparkles" className="w-10 h-10 text-neutral-800 mb-6"/>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-2">System Ready</h2>
                    <p className="text-sm text-neutral-500 leading-relaxed">Input your campaign metrics and ad creative screenshots on the left. Our AI will perform a deep neural audit of your ROI leaks.</p>
                </div>
            )}
            
            {output && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto pb-20">
                    <Card title="ROI Intelligence Diagnosis" icon="check-circle" fullWidth>
                        <div className="bg-[#111] p-8 border border-[#222] font-sans">
                            {renderMarkdown(output.roiDiagnosis)}
                        </div>
                    </Card>

                    <Card title="Budget Leak Heatmap" icon="arrow-trending-down">
                        <div className="space-y-6">
                            {output.moneyLeakHeatmap.map((item, i) => (
                                <div key={i} className="flex gap-4 items-start group">
                                    <SeverityBadge severity={item.severity} />
                                    <div>
                                        <h4 className="text-white text-sm font-bold uppercase tracking-tight">{item.area}</h4>
                                        <p className="text-xs text-neutral-500 mt-1">{item.issue}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Tracking & Attribution" icon="wrench-screwdriver">
                         <div className="font-mono text-[11px] leading-relaxed">
                            {renderMarkdown(output.trackingFixes)}
                         </div>
                    </Card>

                    <Card title="30-Day Stabilization Plan" icon="calendar-days" fullWidth>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {output.roiBoostPlan.map((item, i) => (
                                <div key={i} className="bg-[#111] border border-[#222] p-4 group hover:bg-neutral-900 transition-all">
                                    <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">{item.week}</h4>
                                    <p className="text-white text-xs font-bold mb-4">{item.focus}</p>
                                    <ul className="space-y-2">
                                        {item.actions.map((action, j) => (
                                            <li key={j} className="text-[10px] text-neutral-400 flex items-start gap-2">
                                                <span className="text-neutral-600">▪</span>
                                                {action}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Creative Sandbox" icon="sparkles" fullWidth subtitle="Neural Generation Lab">
                         {sandbox && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                                <div className="space-y-4">
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Optimized Hooks</p>
                                    <textarea
                                        value={sandbox.hooks.join('\n')}
                                        onChange={(e) => onHooksChange(e.target.value)}
                                        rows={8}
                                        className="w-full bg-[#111] border border-[#222] text-xs text-neutral-300 p-4 font-mono focus:border-white transition-all outline-none"
                                    />
                                    <button onClick={onGenerateMoreHooks} disabled={sandboxLoading.hooks} className="w-full py-3 text-[10px] font-bold uppercase tracking-widest bg-neutral-800 text-white hover:bg-neutral-700">
                                        {sandboxLoading.hooks ? 'Recalculating...' : 'Expand Hooks'}
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Ad Body Variations</p>
                                    {sandbox.copy.map((c, i) => (
                                        <div key={i} className="space-y-3">
                                            <textarea
                                                value={c}
                                                onChange={(e) => onCopyChange(i, e.target.value)}
                                                rows={5}
                                                className="w-full bg-[#111] border border-[#222] text-xs text-neutral-300 p-4 focus:border-white transition-all outline-none"
                                            />
                                            <button onClick={() => onRewriteCopy(i)} disabled={sandboxLoading.copy === i} className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-500 hover:text-white transition-colors">
                                                {sandboxLoading.copy === i ? 'Processing...' : 'Neural Rewrite'}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-8">
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Visual Assets</p>
                                    {sandbox.imagePrompts.map((prompt, i) => (
                                        <div key={i} className="space-y-4 border-b border-[#222] pb-6 last:border-0">
                                            {images[i] ? (
                                                <img src={images[i]} className="w-full grayscale hover:grayscale-0 transition-all duration-700 border border-[#222]" />
                                            ) : (
                                                <div className="aspect-square bg-[#111] border border-[#222] flex items-center justify-center text-[10px] text-neutral-700 uppercase tracking-widest">Asset Pending</div>
                                            )}
                                            <textarea
                                                value={prompt}
                                                onChange={(e) => onPromptChange(i, e.target.value)}
                                                rows={2}
                                                className="w-full bg-black border border-[#222] text-[10px] text-neutral-500 p-3 italic"
                                            />
                                            <button onClick={() => onRegenerateImage(i)} disabled={sandboxLoading.image === i} className="w-full py-3 text-[10px] font-bold uppercase tracking-widest border border-[#333] hover:border-white transition-all">
                                                {sandboxLoading.image === i ? 'Synthesizing...' : 'Re-Generate Asset'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         )}
                    </Card>

                    <Card title="System Workspace" icon="sparkles" fullWidth>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2 block">Neural Task Module</label>
                                    <select
                                        value={workspace.task}
                                        onChange={(e) => setWorkspace({ task: e.target.value as WorkspaceTask, input: '', output: '' })}
                                        className="w-full bg-[#111] border border-[#222] text-xs text-white p-3 outline-none focus:border-white transition-all"
                                    >
                                        {WORKSPACE_TASKS.map(task => (
                                            <option key={task} value={task} disabled={isDiagnosisTask(task) && !output}>{task}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2 block">Source Material</label>
                                    <textarea
                                        value={workspace.input}
                                        onChange={(e) => setWorkspace(prev => ({...prev, input: e.target.value}))}
                                        rows={6} 
                                        placeholder={isDiagnosisTask(workspace.task) ? "Data pulled from diagnosis automatically." : "Input raw data for the AI to process..."}
                                        className="w-full bg-[#111] border border-[#222] text-xs text-neutral-400 p-4 focus:border-white outline-none placeholder:text-neutral-800"
                                        disabled={isDiagnosisTask(workspace.task)}
                                    />
                                </div>
                                <button onClick={onWorkspaceSubmit} disabled={isLoading} className="w-full py-4 text-[10px] font-bold uppercase tracking-widest bg-white text-black hover:bg-neutral-200">
                                    {isLoading ? 'Processing...' : 'Execute Neural Task' }
                                </button>
                            </div>
                            <div className="bg-black border border-[#222] p-8 min-h-[300px]">
                                <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-4 block">Process Output</label>
                                <div className="text-xs text-neutral-300 leading-relaxed font-mono">
                                    {workspace.output ? renderMarkdown(workspace.output) : <span className="text-neutral-800 italic">No output yet...</span>}
                                </div>
                            </div>
                         </div>
                    </Card>
                     
                    <Card title="Subscription Protocols" icon="check-circle" fullWidth>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                            {PRICING_PLANS.map(plan => (
                                <div key={plan.name} className="border border-[#222] bg-[#0A0A0A] p-10 flex flex-col group hover:border-neutral-500 transition-all">
                                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{plan.name}</h3>
                                    <p className="text-3xl font-light text-white my-4">{plan.price.split(' ')[0]}<span className="text-xs text-neutral-500 ml-1">/ mo</span></p>
                                    <p className="text-[11px] text-neutral-500 mb-8 h-10 leading-relaxed uppercase tracking-tighter">{plan.description}</p>
                                    <ul className="space-y-3 mb-10 flex-grow">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="w-1 h-1 bg-neutral-600 rounded-full mt-1.5 group-hover:bg-white"></div>
                                                <span className="text-[10px] uppercase tracking-tight text-neutral-400 group-hover:text-neutral-200">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <a href={plan.url} target="_blank" className="w-full py-4 text-center text-[10px] font-bold uppercase tracking-widest bg-white text-black hover:bg-neutral-200">
                                         Select Protocol
                                    </a>
                                </div>
                            ))}
                         </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default OutputPanel;
