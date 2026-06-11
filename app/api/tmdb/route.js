export const runtime = 'nodejs';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const KEY = process.env.TMDB_API_KEY;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (!KEY) return Response.json({ error: 'TMDB key not configured' }, { status: 500 });

  const headers = { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' };

  try {
    if (action === 'search') {
      const query = searchParams.get('q');
      const year = searchParams.get('year') || '';
      let url = `${TMDB_BASE}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`;
      if (year) url += `&year=${year}`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      const film = data.results?.[0];
      if (!film) return Response.json({ error: 'Not found' }, { status: 404 });
      return Response.json({
        id: film.id,
        title: film.title,
        year: film.release_date?.split('-')[0],
        poster_path: film.poster_path,
        overview: film.overview,
        vote_average: film.vote_average,
      });
    }

    if (action === 'details') {
      const id = searchParams.get('id');
      const [detailRes, providerRes] = await Promise.all([
        fetch(`${TMDB_BASE}/movie/${id}?language=en-US&append_to_response=credits`, { headers }),
        fetch(`${TMDB_BASE}/movie/${id}/watch/providers`, { headers }),
      ]);
      const detail = await detailRes.json();
      const providers = await providerRes.json();
      const region = providers.results?.GB || providers.results?.US || {};
      const streaming = (region.flatrate || region.free || []).slice(0, 4).map(p => p.provider_name);
      const director = detail.credits?.crew?.find(c => c.job === 'Director')?.name || '';
      return Response.json({
        id: detail.id,
        title: detail.title,
        year: detail.release_date?.split('-')[0],
        runtime: detail.runtime ? `${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m` : '',
        dir: director,
        poster_path: detail.poster_path,
        imdb: detail.vote_average ? parseFloat(detail.vote_average.toFixed(1)) : null,
        overview: detail.overview,
        genres: detail.genres?.map(g => g.name) || [],
        streaming,
        tagline: detail.tagline || '',
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
