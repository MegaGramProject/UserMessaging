using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;
using Megagram.Models;

namespace Megagram.Services
{
    public class MegaDBService
    {
        private readonly IMongoCollection<CurrentlyActiveSessionKey> _currentlyActiveSessionKeys;

        public MegaDBService(IMongoCollection<CurrentlyActiveSessionKey> currentlyActiveSessionKeys)
        {
            _currentlyActiveSessionKeys = currentlyActiveSessionKeys;
        }

        public async Task<List<CurrentlyActiveSessionKey>> listAllCurrentlyActiveSessionKeys()
        {
            return await _currentlyActiveSessionKeys.Find(_ => true).ToListAsync();
        }

        public async Task addCurrentlyActiveSessionKey(CurrentlyActiveSessionKey newKey)
        {
            _currentlyActiveSessionKeys.InsertOneAsync(newKey);
        }

        public async Task<List<CurrentlyActiveSessionKey>> listCurrentlyActiveSessionKeysBasedOnConvoIds(string[] convoIds)
        {
            var setOfConvoIds = new HashSet<string>(convoIds);

            var filter = Builders<CurrentlyActiveSessionKey>.Filter.In(key => key.convoId, setOfConvoIds);

            return await _currentlyActiveSessionKeys.Find(filter).ToListAsync();
        }
    }

}
