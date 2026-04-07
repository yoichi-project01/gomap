import { fetchAllMaps, fetchMapById, insertMap } from "../services/mapsService.js";

// マップ一覧を返す
export async function getAllMaps(req, res) {
  try {
    const maps = await fetchAllMaps();
    res.json(maps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
}

// 特定のマップを返す
export async function getMapById(req, res) {
  try {
    const { id } = req.params;
    const map = await fetchMapById(id);
    if (!map) {
      return res.status(404).json({ message: "マップが見つかりません" });
    }
    res.json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
}

// 新しいマップを作成する
export async function createMap(req, res) {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: "タイトルは必須です" });
    }
    const newMap = await insertMap({ title, description });
    res.status(201).json(newMap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
}
