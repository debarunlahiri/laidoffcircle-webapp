"use client";
import SelectField from "@/components/ui/select-field";
import {
  maxPollOptions,
  minPollOptions,
  pollDurations,
} from "@/hooks/use-post-composer";
import { usePlatform } from "@/providers/platform-provider";
import { BarChart3, Plus, TriangleAlert, X } from "lucide-react";

// Poll editor inside the post composer. Options can be added and removed freely
// between 2 and 6; the post text above is the question.
export default function PollBuilder() {
  const {
    pollOptions,
    addPollOption,
    removePollOption,
    setPollOption,
    pollMultiple,
    setPollMultiple,
    pollHours,
    setPollHours,
    setPollOpen,
    pollProblem,
  } = usePlatform();
  return (
    <fieldset className="poll-builder">
      <legend className="sr-only">Poll options</legend>
      <div className="poll-builder-head">
        <span className="poll-builder-icon" aria-hidden="true">
          <BarChart3 size={18} />
        </span>
        <div>
          <strong>Create a poll</strong>
          <small>Your post text above is the question.</small>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="Remove poll"
          onClick={() => setPollOpen(false)}
        >
          <X size={18} />
        </button>
      </div>
      <ol className="poll-builder-options">
        {pollOptions.map((option, index) => (
          <li className="poll-builder-row" key={index}>
            <span
              className={`poll-mark${pollMultiple ? " square" : ""}`}
              aria-hidden="true"
            />
            <input
              aria-label={`Option ${index + 1}`}
              placeholder={`Option ${index + 1}`}
              maxLength={100}
              value={option}
              onChange={(event) => setPollOption(index, event.target.value)}
            />
            {pollOptions.length > minPollOptions && (
              <button
                type="button"
                className="icon-button"
                aria-label={`Remove option ${index + 1}`}
                onClick={() => removePollOption(index)}
              >
                <X size={16} />
              </button>
            )}
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="poll-add"
        disabled={pollOptions.length >= maxPollOptions}
        onClick={addPollOption}
      >
        <Plus size={16} /> Add option
        <span>
          {pollOptions.length}/{maxPollOptions}
        </span>
      </button>
      <div className="poll-builder-settings">
        <label className="poll-switch">
          <input
            type="checkbox"
            role="switch"
            checked={pollMultiple}
            onChange={(event) => setPollMultiple(event.target.checked)}
          />
          <span className="poll-switch-track" aria-hidden="true" />
          <span>
            Allow multiple answers
            <small>Voters can pick more than one option</small>
          </span>
        </label>
        <SelectField
          label="Poll length"
          placeholder="1 week"
          value={pollHours}
          options={pollDurations}
          onChange={setPollHours}
        />
      </div>
      {pollProblem && (
        <p className="poll-builder-hint" role="status">
          <TriangleAlert size={14} /> {pollProblem}
        </p>
      )}
    </fieldset>
  );
}
