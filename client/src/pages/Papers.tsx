import React, { useEffect, useState } from 'react';

interface PaperItem {
	id: number | string;
	title: string;
	abstract: string;
	first_name?: string;
	last_name?: string;
	institution?: string;
}

const Papers: React.FC = () => {
	const [papers, setPapers] = useState<PaperItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');

	useEffect(() => {
		const fetchPapers = async () => {
			try {
				const q = search ? `?search=${encodeURIComponent(search)}` : '';
				const res = await fetch(`/api/papers${q}`);
				const data = await res.json();
				// backend returns { papers: [...] }
				setPapers(data.papers || []);
			} catch (err) {
				console.error('Failed to load papers', err);
				setPapers([]);
			} finally {
				setLoading(false);
			}
		};

		fetchPapers();
	}, [search]);

	return (
		<div className="container">
			<div className="page-header">
				<h1>Research Papers</h1>
				<p className="text-muted">Browse submitted research papers, filter and search by keywords, disease, region and collaboration status.</p>
			</div>

			<div className="card mb-4">
				<div className="card-body">
					<div className="form-group">
						<input
							type="search"
							className="form-control"
							placeholder="Search papers by title, abstract, keywords, methodology..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{loading ? (
				<div>Loading papers…</div>
			) : (
				<div className="grid grid-3 gap-4">
					{papers.length === 0 && <div className="card p-4">No papers found.</div>}
					{papers.map((p) => (
						<div key={p.id} className="card">
							<div className="card-body">
								<h3>{p.title}</h3>
								<p className="text-muted">{p.abstract ? p.abstract.substring(0, 300) + (p.abstract.length > 300 ? '…' : '') : ''}</p>
								<p className="text-sm">Author: {p.first_name} {p.last_name} {p.institution && `— ${p.institution}`}</p>
								<div className="mt-2">
									<a className="btn btn-sm btn-outline" href={`/papers/${p.id}`}>View</a>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Papers;