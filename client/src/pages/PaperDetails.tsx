import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Paper {
	id: number;
	title: string;
	abstract: string;
	institutional_affiliation?: string;
	first_name?: string;
	last_name?: string;
	submission_date?: string;
}

interface Agreement {
	id: number;
	paper_id: number;
	agreement_text: string;
	signer_user_id?: number;
	signer_name?: string;
	signer_title?: string;
	signer_institution?: string;
	signed_at?: string;
	created_at?: string;
}

const PaperDetails: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [paper, setPaper] = useState<Paper | null>(null);
	const [agreements, setAgreements] = useState<Agreement[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				const paperRes = await fetch(`/api/papers/${id}`);
				const paperData = await paperRes.json();
				setPaper(paperData.paper || null);

				const agrRes = await fetch(`/api/papers/${id}/agreements`);
				const agrData = await agrRes.json();
				setAgreements(agrData.agreements || []);
			} catch (err) {
				console.error('Failed to load paper details', err);
			} finally {
				setLoading(false);
			}
		};
		if (id) load();
	}, [id]);

	if (loading) return <div className="container">Loading…</div>;
	if (!paper) return <div className="container">Paper not found.</div>;

	return (
		<div className="container">
			<div className="card mb-4">
				<div className="card-body">
					<h1>{paper.title}</h1>
					<p className="text-muted">Submitted by {paper.first_name} {paper.last_name} {paper.institutional_affiliation && `— ${paper.institutional_affiliation}`}</p>
					<div className="mt-4">
						<h3>Abstract</h3>
						<p>{paper.abstract}</p>
					</div>
				</div>
			</div>

			<div className="card">
				<div className="card-header">
					<h3>Collaboration Agreements</h3>
				</div>
				<div className="card-body">
					{agreements.length === 0 && <p className="text-muted">No collaboration agreements found for this paper.</p>}

					{agreements.map(a => (
						<div key={a.id} className="agreement card mb-3 p-3">
							<div className="flex justify-between items-center mb-2">
								<div>
									<strong>Signed by:</strong> {a.signer_name || 'Unknown'} {a.signer_title ? `— ${a.signer_title}` : ''}
									{a.signer_institution && <span> ({a.signer_institution})</span>}
								</div>
								<div className="text-sm text-gray-600">{a.signed_at ? new Date(a.signed_at).toLocaleString() : new Date(a.created_at || '').toLocaleString()}</div>
							</div>
							<div className="agreement-text text-sm white-space-pre-wrap">{a.agreement_text}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default PaperDetails;