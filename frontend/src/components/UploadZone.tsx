import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, Sparkles } from 'lucide-react';

interface Props {
  onAnalyze: (file: File, jobDesc: string, jobTitle: string) => void;
  loading: boolean;
}

export default function UploadZone({ onAnalyze, loading }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [showJob, setShowJob] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = () => {
    if (file) onAnalyze(file, jobDesc, jobTitle);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative group cursor-pointer rounded-2xl border-2 border-dashed p-12
          transition-all duration-300 ease-out
          ${isDragActive
            ? 'border-brand-500 bg-brand-50 scale-[1.02]'
            : file
              ? 'border-emerald-400 bg-emerald-50/50'
              : 'border-gray-300 bg-white hover:border-brand-400 hover:bg-brand-50/30'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 text-center">
          {file ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(0)} KB · Click or drop to replace
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag & drop a PDF or click to browse · Max 10 MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Optional job description */}
      {file && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => setShowJob(!showJob)}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            {showJob ? 'Hide' : 'Add'} job description for targeted analysis
          </button>

          {showJob && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Job title (e.g., Senior Software Engineer)"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
              />
              <textarea
                placeholder="Paste the job description here for skill gap analysis..."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition resize-none"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold
              hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40
              flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze Resume
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
