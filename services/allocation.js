const db = require("../db/index");

/* Get all allocations */

const getAll = () => {
  const sqlQuery =
    "SELECT id, name, isSeasonAlloc, description, lastmodified FROM AllocRound ar;";
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/* Get allocation by id */

const getById = (id) => {
  sqlQuery =
    "SELECT id, name, isSeasonAlloc, description, lastmodified FROM AllocRound ar WHERE id=?;";
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, id, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Get all subjects in allocation by id
const getAllSubjectsById = (id) => {
  const allocRound = id;
  const sqlQuery = `SELECT 
        s.id, 
        s.name, 
        as2.isAllocated, 
        as2.cantAllocate,
        as2.priority,
        IFNULL((SELECT CAST(SUM(TIME_TO_SEC(al_sp.totalTime)/3600) AS DECIMAL(10,1))
            FROM AllocSpace al_sp
            WHERE al_sp.allocRound = ? AND al_sp.subjectId = s.id
            GROUP BY al_sp.subjectId), 0) AS "AllocatedHours",
        CAST((TIME_TO_SEC(s.sessionLength) * s.groupCount * s.sessionCount / 3600) AS DECIMAL(10,1)) AS "requiredHours"
    FROM Subject s
    INNER JOIN AllocSubject as2 ON s.id = as2.subjectId
    LEFT JOIN AllocSpace al_sp ON s.id = al_sp.subjectId
    WHERE as2.allocRound = ?
    GROUP BY s.id
    ORDER BY as2.priority ASC;`;
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, [allocRound, allocRound], (err, result) => {
      if (err) {
        return reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/* Get all subjects in space by allocRoundId and SpaceId*/

const getSubjectsByAllocRoundAndSpaceId = (allocRound, spaceId) => {
  const sqlQuery = `
    SELECT 
    	s.id, 
    	s.name, 
    	CAST((TIME_TO_SEC(al_sp.totalTime) / 3600) AS DECIMAL(10,1)) AS "allocatedHours"
    FROM AllocSpace al_sp
    INNER JOIN Subject s ON al_sp.subjectId = s.id 
    WHERE al_sp.allocRound = ? AND al_sp.spaceId = ?;`;
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, [allocRound, spaceId], (err, result) => {
      if (err) {
        return reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/* Get rooms by Subject and AllocRound */

const getRoomsBySubjectAndAllocRound = (subjectId, allocRound) => {
  const sqlQuery = `
    SELECT s.id, s.name, CAST(TIME_TO_SEC(as2.totalTime)/3600 AS DECIMAL(10,1)) AS "allocatedHours"
    FROM Space s
    INNER JOIN AllocSpace as2 ON s.id = as2.spaceId
    WHERE as2.subjectId = ? AND as2.allocRound = ?;`;
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, [subjectId, allocRound], (err, result) => {
      if (err) {
        return reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/* Get allocated rooms with allocatedHours */

const getRoomsByAllocId = (allocRoundId) => {
  const sqlQuery = `SELECT 
        id, 
        name, 
        CAST(SUM(TIME_TO_SEC(AllocSpace.totalTime))/3600 AS DECIMAL(10,1)) AS 'allocatedHours', 
        HOUR(TIMEDIFF(Space.availableTO, Space.availableFrom))*5 AS 'requiredHours' 
    FROM Space 
    LEFT JOIN AllocSpace ON Space.id = AllocSpace.spaceId 
    WHERE AllocSpace.allocRound = ? 
    GROUP BY id
    ;`;
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, allocRoundId, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/* Get allocated rooms by Program.id and AllocRound.id */

const getAllocatedRoomsByProgram = async (programId, allocId) => {
  const sqlQuery = `SELECT DISTINCT s.id, s.name, CAST(SUM(TIME_TO_SEC(as2.totalTime)/3600) AS DECIMAL(10,1)) AS allocatedHours 
                    FROM AllocSpace as2
                    LEFT JOIN Space s ON as2.spaceId = s.id
                    LEFT JOIN Subject s2 ON as2.subjectId = s2.id
                    LEFT JOIN Program p ON s2.programId = p.id 
                    WHERE p.id = ? AND as2.allocRound = ?
                    GROUP BY s.id
                    ;`;
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, [programId, allocId], (err, result) => {
      if (err) {
        return reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/* Get allocated rooms by Subject.id and AllocRound.id */
const getAllocatedRoomsBySubject = async (subjectId, allocId) => {
  const sqlQuery = `SELECT DISTINCT s.id, s.name, CAST(SUM(TIME_TO_SEC(aspace.totalTime)/3600) AS DECIMAL(10,1)) AS allocatedHours
                    FROM AllocSpace AS aspace
                    LEFT JOIN Space s ON aspace.spaceId = s.id
                    LEFT JOIN Subject sub ON aspace.subjectId = sub.id
                    WHERE sub.id = ? AND aspace.allocRound = ?
                    GROUP BY s.id
                    ;`;
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, [subjectId, allocId], (err, result) => {
      if (err) {
        return reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
/* Get subjects by Program.id and AllocRound.id */

const getSubjectsByProgram = (allocRound, programId) => {
  const sqlQuery = `
    SELECT 
    	s.id, 
    	s.name, 
    	CAST(SUM(TIME_TO_SEC(as2.totalTime) / 3600) AS DECIMAL(10,1)) AS "allocatedHours",
        CAST((s.groupCount * TIME_TO_SEC(s.sessionLength) * s.sessionCount / 3600) AS DECIMAL(10,1)) as "requiredHours"
        FROM Subject s
    JOIN Program p ON s.programId = p.id
    JOIN AllocSpace as2 ON s.id = as2.subjectId
    WHERE p.id = ? AND as2.allocRound = ?
    GROUP BY as2.subjectId;`;
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, [programId, allocRound], (err, result) => {
      if (err) {
        return reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/* START ALLOCATION - Procedure in database */
const startAllocation = (allocRound) => {
  const sqlQuery = "CALL startAllocation(?)";
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, allocRound, (err, result) => {
      if (err) {
        return reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/* RESET ALLOCATION - Procedure in database */
const resetAllocation = (allocRound) => {
  const sqlQuery = "CALL resetAllocation(?)";

  return new Promise((resolve, reject) => {
    db.query(sqlQuery, allocRound, (err, result) => {
      if (err) {
        return reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const getSuitableRoomsForSubject = (allocRound, subject) => {
  const sqlQuery =
    "SELECT * FROM AllocSubjectSuitableSpace ass WHERE ass.allocRound = ? AND ass.subjectId = ?;";
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, [allocRound, subject], (err, result) => {
      if (err) {
        return reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  getAll,
  getById,
  getAllSubjectsById,
  getSubjectsByAllocRoundAndSpaceId,
  getRoomsBySubjectAndAllocRound,
  getRoomsByAllocId,
  getSubjectsByProgram,
  getAllocatedRoomsByProgram,
  startAllocation,
  resetAllocation,
  getSuitableRoomsForSubject,
  getAllocatedRoomsBySubject,
};