import { useState } from "react";
import { useSaves } from "../context/SavesContext";
import { buildDisplayUrl } from "../utils/cloudinaryUrl";

export default function SavesPage() {
    const { saved, boards, getSavedByBoard, unsave, createBoard, deleteBoard } = useSaves();
    const [activeBoard, setActiveBoard] = useState("all");
    const [newBoardName, setNewBoardName] = useState("");
    const [showNewBoard, setShowNewBoard] = useState(false);

    const displayItems = getSavedByBoard(activeBoard);

    const handleCreateBoard = () => {
        const name = newBoardName.trim();
        if (!name) return;
        const board = createBoard(name);
        setNewBoardName("");
        setShowNewBoard(false);
        setActiveBoard(board.id);
    };

    return (
        <main className="saves-page">
            <section className="saves-hero">
                <div className="section-eyebrow">Your Collection</div>
                <h1 className="font-display saves-title">Saved Pieces</h1>
                <p className="saves-subtitle">
                    {saved.length} item{saved.length !== 1 ? "s" : ""} saved across {boards.length} board{boards.length !== 1 ? "s" : ""}
                </p>
            </section>

            {/* Board tabs */}
            <div className="saves-boards">
                {boards.map((board) => (
                    <button
                        key={board.id}
                        type="button"
                        className={`saves-board-tab${activeBoard === board.id ? " active" : ""}`}
                        onClick={() => setActiveBoard(board.id)}
                    >
                        {board.name}
                        <span className="saves-board-count">
                            {getSavedByBoard(board.id).length}
                        </span>
                    </button>
                ))}

                {showNewBoard ? (
                    <div className="saves-new-board-form">
                        <input
                            type="text"
                            className="saves-new-board-input"
                            placeholder="Board name..."
                            value={newBoardName}
                            onChange={(e) => setNewBoardName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
                            autoFocus
                        />
                        <button type="button" className="saves-new-board-ok" onClick={handleCreateBoard}>
                            ✓
                        </button>
                        <button
                            type="button"
                            className="saves-new-board-cancel"
                            onClick={() => { setShowNewBoard(false); setNewBoardName(""); }}
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        className="saves-board-tab saves-board-add"
                        onClick={() => setShowNewBoard(true)}
                    >
                        + New Board
                    </button>
                )}

                {activeBoard !== "all" && (
                    <button
                        type="button"
                        className="saves-board-delete"
                        onClick={() => { deleteBoard(activeBoard); setActiveBoard("all"); }}
                    >
                        Delete Board
                    </button>
                )}
            </div>

            {/* Grid */}
            {displayItems.length === 0 ? (
                <div className="saves-empty">
                    <p>No saved items yet. Browse the shop and tap the bookmark icon on listings you love.</p>
                    <a href="/shop" className="btn-primary">Browse Shop</a>
                </div>
            ) : (
                <div className="saves-grid">
                    {displayItems.map((item) => {
                        const imgUrl = item.listing.cloudinaryUrl
                            ? buildDisplayUrl(item.listing.cloudinaryUrl, {
                                width: 400,
                                height: 533,
                                removeBg: item.listing.transformations?.removeBg,
                            })
                            : "";

                        return (
                            <a key={item.listing._id} href={`/listing/${item.listing._id}`} className="saves-card">
                                <div className="saves-card-img-wrap">
                                    {imgUrl ? (
                                        <img src={imgUrl} alt={item.listing.title} className="saves-card-img" loading="lazy" />
                                    ) : (
                                        <div className="saves-card-img-ph">No Image</div>
                                    )}
                                    <button
                                        type="button"
                                        className="saves-card-unsave"
                                        onClick={(e) => { e.preventDefault(); unsave(item.listing._id); }}
                                        title="Remove from saves"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="saves-card-info">
                                    <h3 className="saves-card-name">{item.listing.title}</h3>
                                    <p className="saves-card-price">${item.listing.price}</p>
                                </div>
                            </a>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
