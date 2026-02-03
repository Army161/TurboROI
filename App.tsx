
import React, { useState, useCallback, useEffect } from 'react';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import { Inputs, DiagnosisOutput, Platform, WorkspaceTask, CreativePack, HistoryItem } from './types';
import { runDiagnosis, generateImages, runWorkspaceTask, runSandboxTask } from './services/geminiService';
import { DIAGNOSIS_DEPENDENT_TASKS } from './constants';

const LOCAL_STORAGE_KEY = 'roi_turbo_history';

const App: React.FC = () => {
    const [inputs, setInputs] = useState<Inputs>({
        platform: Platform.Meta,
        performanceData: '',
        adCopy: '',
        adSpend: 5000,
        adScreenshot: null,
        deepAudit: false,
    });

    const [output, setOutput] = useState<DiagnosisOutput | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isGeneratingImages, setIsGeneratingImages] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [workspace, setWorkspace] = useState({
        task: WorkspaceTask.PolishAdCopy,
        input: '',
        output: '',
    });

    const [sandbox, setSandbox] = useState<CreativePack | null>(null);
    const [sandboxLoading, setSandboxLoading] = useState({ hooks: false, copy: -1, image: -1 });
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Load history on mount
    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load history", e);
            }
        }
    }, []);

    const saveAuditToHistory = useCallback((auditOutput: DiagnosisOutput, auditInputs: Inputs) => {
        const newItem: HistoryItem = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            inputs: auditInputs,
            output: auditOutput,
        };
        const updatedHistory = [newItem, ...history].slice(0, 10); // Keep last 10
        setHistory(updatedHistory);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
    }, [history]);

    const handleRunDiagnosis = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setOutput(null);
        setImages([]);
        setSandbox(null);

        try {
            const result = await runDiagnosis(inputs);
            setOutput(result);
            if (result.viralCreativePack) {
                setSandbox(JSON.parse(JSON.stringify(result.viralCreativePack))); // Deep copy
            }
            saveAuditToHistory(result, inputs);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred during diagnosis.");
        } finally {
            setIsLoading(false);
        }
    }, [inputs, saveAuditToHistory]);

    const handleLoadHistory = useCallback((item: HistoryItem) => {
        setInputs(item.inputs);
        setOutput(item.output);
        setImages([]);
        if (item.output.viralCreativePack) {
            setSandbox(JSON.parse(JSON.stringify(item.output.viralCreativePack)));
        }
    }, []);

    const handleClearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }, []);

    const handleGenerateImages = useCallback(async () => {
        if (!output?.viralCreativePack?.imagePrompts) {
            setError("Run a diagnosis first to get image prompts.");
            return;
        }
        setIsGeneratingImages(true);
        setError(null);
        setImages([]);

        try {
            const generated = await generateImages(output.viralCreativePack.imagePrompts);
            setImages(generated);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred while generating images.");
        } finally {
            setIsGeneratingImages(false);
        }
    }, [output]);

    const handleWorkspaceSubmit = useCallback(async () => {
        setWorkspace(prev => ({...prev, output: 'Loading...'}));
        try {
            const isDiagnosisTask = DIAGNOSIS_DEPENDENT_TASKS.includes(workspace.task as WorkspaceTask);

            if (isDiagnosisTask && !output) {
                setWorkspace(prev => ({...prev, output: 'Please run a diagnosis before using this task.'}));
                return;
            }

            let content = workspace.input;
            let diagnosisForTask: string | undefined;

            if (isDiagnosisTask && output) {
                if (workspace.task === WorkspaceTask.CreateChecklistFromPlan) {
                    diagnosisForTask = JSON.stringify(output.roiBoostPlan);
                } else {
                    diagnosisForTask = JSON.stringify(output);
                }
                content = ''; // Content comes from the diagnosis, not the input field.
            }
            
            const result = await runWorkspaceTask(workspace.task, content, {
                diagnosis: diagnosisForTask,
            });

            setWorkspace(prev => ({...prev, output: result}));
        } catch (e: any) {
             setWorkspace(prev => ({...prev, output: `Error: ${e.message}`}));
        }
    }, [workspace.task, workspace.input, output]);

    const handleGenerateMoreHooks = useCallback(async () => {
        if (!sandbox) return;
        setSandboxLoading(prev => ({ ...prev, hooks: true }));
        try {
            const newHooksJson = await runSandboxTask('generate_hooks', {
                copy: sandbox.copy[0],
                hooks: sandbox.hooks,
                platform: inputs.platform,
            });
            const newHooks = JSON.parse(newHooksJson);
            setSandbox(prev => prev ? { ...prev, hooks: [...prev.hooks, ...newHooks] } : null);
        } catch (e: any) {
            setError(`Failed to generate hooks: ${e.message}`);
        } finally {
            setSandboxLoading(prev => ({ ...prev, hooks: false }));
        }
    }, [sandbox, inputs.platform]);

    const handleRewriteCopy = useCallback(async (index: number) => {
        if (!sandbox) return;
        setSandboxLoading(prev => ({ ...prev, copy: index }));
        try {
            const newCopy = await runSandboxTask('rewrite_copy', {
                copy: sandbox.copy[index],
                platform: inputs.platform,
            });
            setSandbox(prev => {
                if (!prev) return null;
                const updatedCopy = [...prev.copy];
                updatedCopy[index] = newCopy;
                return { ...prev, copy: updatedCopy };
            });
        } catch (e: any) {
            setError(`Failed to rewrite copy: ${e.message}`);
        } finally {
            setSandboxLoading(prev => ({ ...prev, copy: -1 }));
        }
    }, [sandbox, inputs.platform]);

    const handleRegenerateImage = useCallback(async (index: number) => {
        if (!sandbox) return;
        setSandboxLoading(prev => ({ ...prev, image: index }));
        try {
            const [newImage] = await generateImages([sandbox.imagePrompts[index]]);
            setImages(prevImages => {
                const updatedImages = [...prevImages];
                updatedImages[index] = newImage;
                return updatedImages;
            });
        } catch (e: any) {
            setError(`Failed to regenerate image: ${e.message}`);
        } finally {
            setSandboxLoading(prev => ({ ...prev, image: -1 }));
        }
    }, [sandbox]);

    const handlePromptChange = (index: number, value: string) => {
        setSandbox(prev => {
            if (!prev) return null;
            const newPrompts = [...prev.imagePrompts];
            newPrompts[index] = value;
            return { ...prev, imagePrompts: newPrompts };
        });
    };
    
    const handleHooksChange = (value: string) => {
        setSandbox(prev => prev ? { ...prev, hooks: value.split('\n').filter(h => h.trim() !== '') } : null);
    };
    
    const handleCopyChange = (index: number, value: string) => {
        setSandbox(prev => {
            if (!prev) return null;
            const newCopy = [...prev.copy];
            newCopy[index] = value;
            return { ...prev, copy: newCopy };
        });
    };


    return (
        <div className="flex flex-col lg:flex-row h-screen font-sans bg-black">
            <InputPanel 
                inputs={inputs} 
                setInputs={setInputs} 
                onRunDiagnosis={handleRunDiagnosis}
                onGenerateImages={handleGenerateImages}
                isLoading={isLoading || isGeneratingImages}
                canGenerateImages={!!output?.viralCreativePack?.imagePrompts?.length}
                history={history}
                onLoadHistory={handleLoadHistory}
                onClearHistory={handleClearHistory}
            />
            <OutputPanel 
                output={output}
                images={images}
                workspace={workspace}
                setWorkspace={setWorkspace}
                onWorkspaceSubmit={handleWorkspaceSubmit}
                isLoading={isLoading}
                isGeneratingImages={isGeneratingImages}
                error={error}
                sandbox={sandbox}
                sandboxLoading={sandboxLoading}
                onGenerateMoreHooks={handleGenerateMoreHooks}
                onRewriteCopy={handleRewriteCopy}
                onRegenerateImage={handleRegenerateImage}
                onPromptChange={handlePromptChange}
                onHooksChange={handleHooksChange}
                onCopyChange={handleCopyChange}
            />
        </div>
    );
};

export default App;
