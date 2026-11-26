-- Invalidate quick-rating tokens that may have been handed to the wrong browser.
--
-- Before fix-rating-identity, a quick rating with no matching token was matched by
-- IP: the existing row was UPDATEd and its ownership_token sent back to the new
-- browser. People on shared Wi-Fi or carrier IPs could end up holding a stranger's
-- token and keep overwriting that stranger's rating.
--
-- Every token handed out that way belongs to a row that was updated after it was
-- created, so only those rows get a fresh token that no browser holds. Their ratings
-- stay counted; the holders just can't change them any more, and their next rating
-- of that recipe creates a new row of their own.
--
-- Run once, after the fix-rating-identity code is deployed.

UPDATE comments
SET ownership_token = 'rotated-' || gen_random_uuid()::text
WHERE comment_text = ''
  AND updated_at > created_at;
