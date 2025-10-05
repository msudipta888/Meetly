import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../socket/useSocket';

const LivePollForm = () => {
  const { roomId } = useParams();
  const [pollQuestion, setPollQuestion] = useState("");
  const [optionYes, setOptionYes] = useState("Yes");
  const [optionNo, setOptionNo] = useState("No");
  const [pollActive, setPollActive] = useState(false);
  const [vote, setVote] = useState("");
  const [results, setResults] = useState({ yesPercent: 0, noPercent: 0 });
  const [isHost, setIsHost] = useState(false);

  const socket = useSocket();

  // Host creates poll
  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("live:poll", {
      roomId,
      question: pollQuestion,
      optionYes,
      optionNo,
    });
    setPollActive(true);
    setIsHost(true); // Mark this client as host
  };

  // Listen for poll creation and poll result events
  useEffect(() => {
    const handlePoll = ({ question, optionYes, optionNo, hostId }) => {
     
      if (socket.id !== hostId) {
        setPollQuestion(question);
        setOptionYes(optionYes);
        setOptionNo(optionNo);
        setPollActive(true);
        setIsHost(false); // Ensure non-creators are marked as non-hosts
      }
    };

    const handlePollResult = ({ yesPercent, noPercent }) => {
      // Only the host sees the results
      if (isHost) {
        setResults({ yesPercent, noPercent });
      }
    };

    socket.on("live:poll", handlePoll);
    socket.on("live:poll-final", handlePollResult);

    return () => {
      socket.off("live:poll", handlePoll);
      socket.off("live:poll-final", handlePollResult);
    };
  }, [socket, isHost]);

  // Handle voting (only for non-host users)
  const handleVote = (e) => {
    const selectedValue = e.target.value;
    setVote(selectedValue);
    socket.emit("live:poll-answer", { roomId, vote: selectedValue });
  };

  return (
    <div className="bg-gray-400 text-white p-4">
     
      {!pollActive && (
        <form onSubmit={handleSubmit}>
          <div>
            <textarea
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Enter poll question..."
            />
          </div>
          <div>
            <input
              type="text"
              value={optionYes}
              onChange={(e) => setOptionYes(e.target.value)}
              placeholder="Option 1"
            />
            <input
              type="text"
              value={optionNo}
              onChange={(e) => setOptionNo(e.target.value)}
              placeholder="Option 2"
            />
          </div>
          <button type="submit">Submit Poll</button>
        </form>
      )}

      {/* Poll display */}
      {pollActive && (
        <div className="mt-4 p-4 border">
          <h3>{pollQuestion}</h3>
          {/* Non-host users can vote */}
          {!isHost && vote === "" && (
            <div>
              <div>
                <input
                  type="radio"
                  id="optionYes"
                  name="poll"
                  value="Yes"
                  onChange={handleVote}
                />
                <label htmlFor="optionYes">{optionYes}</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="optionNo"
                  name="poll"
                  value="No"
                  onChange={handleVote}
                />
                <label htmlFor="optionNo">{optionNo}</label>
              </div>
            </div>
          )}
          {!isHost && vote !== "" && <p>You voted: {vote}</p>}
          {/* Host sees updated percentages */}
          {isHost && (
            <div className="mt-2">
              <div>
              <p>{optionYes}: {results.yesPercent}%</p>
            <div style={{width:"30%", backgroundColor:"light-gray"}}>
            <div style={{width: `${Math.min(results.yesPercent,100)}%`,
              height:"14px", backgroundColor:"red", transition: "width 0.5s ease-in-out", // Smooth animation

            }}></div>
            </div>
              </div>
              <div >
              <p>{optionNo}: {results.noPercent}%</p>
             <div style={{width:"30%"}}>
              <div style={{width: `${Math.min(results.noPercent,100)}%`,
              height:"14px", backgroundColor:"blue",       transition: "width 0.5s ease-in-out", // Smooth animation

            }}></div>
             </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LivePollForm;