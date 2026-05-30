# Tailoring

Tailoring is how HumbleHire handles the reality that one CV does not fit every application. You keep one master CV with everything in it and create tailored copies for specific roles or companies. When the master changes later, each tailored copy can pull in the parts that matter and leave the rest alone.

## Master and tailored CVs

A **master CV** is your comprehensive record. There is nothing structurally special about it; "master" is a role, not a separate type. Any CV without a link back to another one acts as a master.

A **tailored CV** starts as a full copy of a master at a moment in time and keeps a link back to that master. After it is created, the two CVs are independent. Edits on either side do not propagate automatically.

A tailored CV is not a draft or a temporary thing. It is a real, standalone CV that happens to remember where it came from.

## Sync

When the master changes, every tailored copy that derives from it shows an "updates available" indicator. Opening the sync view shows the change set as a list of small, separate items: a text edit on one field, a new job entry, a removed achievement inside an existing job, and so on. The list is broken down to the finest reasonable grain so you can decide change-by-change.

For each item you pick **Accept** or **Discard**. Accept applies it to this tailored copy. Discard leaves the tailored copy alone for now and remembers the decision, so the same change does not keep reappearing every time you open the sync view. A discard is good until the master changes again; after the next master edit the diff is recomputed and the item may or may not come back.

This shape matters because tailoring has intent behind it. If you removed an irrelevant job from a tailored copy, you do not want a sweeping "sync from master" to put it back. Selective sync preserves the intentional differences.

## Orphaning

If the master is deleted, the tailored copies that point to it become **orphaned**. An orphaned tailored CV keeps everything it had — content, hidden block choices, name, company — and simply loses the link back. From that point on it behaves like a standalone CV: no sync indicator, no baseline, no master to pull from. The sync history is forgotten because there is nothing left to be in sync with.

There are two paths into this state. From the dashboard, deleting a master with tailored copies offers a choice between deleting everything or keeping the copies as standalone CVs. The second choice triggers orphaning. The other path is silent: opening a tailored CV whose master is no longer in the database orphans it on the spot, with a one-time notice explaining what happened.

An orphaned CV is just a CV. It can become a master itself the moment something is tailored from it.

## Constraints

Sync is one-way. A tailored copy never pushes changes into its master. If you improved a bullet on a tailored copy and want it in the master, you copy it across by hand.

Tailored copies always derive from a master. You cannot tailor a tailored copy. The relationship is one level deep on purpose: deeper chains get confusing fast and the value diminishes.
